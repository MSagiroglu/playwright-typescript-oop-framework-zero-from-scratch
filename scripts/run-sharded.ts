/**
 * EN: Local shard orchestrator — the single-machine equivalent of the CI matrix. Runs the
 *     suite in N shards sequentially (each writes a blob report), then merges the blobs into
 *     one HTML report.
 * TR: Yerel shard orkestratörü — CI matrisinin tek-makine karşılığı. Suite'i sırayla N shard'da
 *     çalıştırır (her biri blob rapor yazar), sonra blob'ları tek bir HTML rapora birleştirir.
 *
 *   npm run test:sharded            # EN: 3 shards (default) / TR: 3 shard (varsayılan)
 *   SHARDS=4 npm run test:sharded   # EN: custom count / TR: özel sayı
 */
import { execSync } from 'node:child_process';

// EN: How many shards to run. / TR: Kaç shard çalıştırılacağı.
const shardTotal = Number(process.env.SHARDS ?? 3);

if (!Number.isInteger(shardTotal) || shardTotal < 1) {
  throw new Error(`SHARDS must be a positive integer, received: ${process.env.SHARDS}`);
}

// EN: Run a command, inheriting stdio, with optional extra env vars.
// TR: Bir komutu, stdio'yu devralarak ve isteğe bağlı ek env değişkenleriyle çalıştır.
const run = (command: string, extraEnv: NodeJS.ProcessEnv = {}): void => {
  execSync(command, { stdio: 'inherit', env: { ...process.env, ...extraEnv } });
};

for (let shard = 1; shard <= shardTotal; shard += 1) {
  console.log(`\n=== Shard ${shard}/${shardTotal} ===`);
  // EN: SHARD_INDEX lets utils/userIdentity.ts give each shard its own pooled account.
  // TR: SHARD_INDEX, utils/userIdentity.ts'in her shard'a kendi havuz hesabını vermesini sağlar.
  run(`npx playwright test --shard=${shard}/${shardTotal} --reporter=blob`, {
    SHARD_INDEX: String(shard),
  });
}

// EN: Combine all shard blobs into one HTML report. / TR: Tüm shard blob'larını tek HTML rapora birleştir.
console.log('\n=== Merging shard reports into HTML ===');
run('npx playwright merge-reports --reporter html ./blob-report');
