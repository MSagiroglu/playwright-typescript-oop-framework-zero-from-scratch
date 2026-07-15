/**
 * EN: Dynamic worker-pool orchestrator. Discovers every spec file and feeds them through a
 *     fixed-size pool: as soon as one spec finishes, that worker pulls the next from a shared
 *     queue. This keeps all workers busy even when specs vary in duration.
 *     `queue.shift()` is safe here: Node is single-threaded, so there is no race.
 * TR: Dinamik worker-havuzu orkestratörü. Tüm spec dosyalarını bulur ve sabit boyutlu bir
 *     havuzdan geçirir: bir spec biter bitmez, o worker paylaşılan kuyruktan bir sonrakini
 *     çeker. Spec süreleri farklı olsa bile tüm worker'ları meşgul tutar.
 *     `queue.shift()` burada güvenlidir: Node tek-iş-parçacıklıdır, yarış durumu yoktur.
 *
 *   npm run test:dynamic              # EN: pool of 3 / TR: 3'lü havuz
 *   POOL_SIZE=4 npm run test:dynamic  # EN: custom size / TR: özel boyut
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// EN: Number of concurrent runners. / TR: Eşzamanlı çalıştırıcı sayısı.
const poolSize = Number(process.env.POOL_SIZE ?? 3);

// EN: Recursively find every *.spec.ts under a directory. / TR: Bir klasör altındaki tüm *.spec.ts'i özyinelemeli bul.
function findSpecs(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findSpecs(full);
    return entry.name.endsWith('.spec.ts') ? [full] : [];
  });
}

// EN: Run one spec in its own process; resolves with the exit code. / TR: Bir spec'i kendi sürecinde çalıştır; çıkış koduyla döner.
function runSpec(spec: string): Promise<number> {
  // EN: Playwright treats the path arg as a regex; backslashes (Windows) break the match,
  //     so always pass POSIX-style forward slashes.
  // TR: Playwright yol argümanını regex sayar; ters eğik çizgiler (Windows) eşleşmeyi bozar,
  //     bu yüzden her zaman POSIX düz eğik çizgi ver.
  const specArg = spec.split(path.sep).join('/');
  return new Promise((resolve) => {
    const child = spawn('npx', ['playwright', 'test', specArg, '--reporter=line'], {
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

// EN: Shared queue + collected results. / TR: Paylaşılan kuyruk + toplanan sonuçlar.
const queue = findSpecs('tests');
const results: { spec: string; ok: boolean }[] = [];

// EN: One worker keeps pulling until the queue is empty. / TR: Bir worker, kuyruk boşalana dek çekmeye devam eder.
async function worker(): Promise<void> {
  let spec: string | undefined;
  while ((spec = queue.shift())) {
    console.log(`\n▶ ${spec}`);
    const code = await runSpec(spec);
    results.push({ spec, ok: code === 0 });
  }
}

// EN: Start the pool and report at the end. / TR: Havuzu başlat ve sonunda raporla.
async function main(): Promise<void> {
  const started = Date.now();
  await Promise.all(Array.from({ length: poolSize }, () => worker()));

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Dynamic run complete in ${Math.round((Date.now() - started) / 1000)}s ===`);
  console.log(`${results.length - failed.length}/${results.length} spec files passed.`);
  if (failed.length > 0) {
    failed.forEach((r) => console.log(`  ✗ ${r.spec}`));
    process.exit(1); // EN: non-zero so CI fails / TR: CI'nin fail olması için sıfır-dışı
  }
}

void main();
