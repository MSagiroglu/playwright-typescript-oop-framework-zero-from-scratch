import { defineConfig, devices } from '@playwright/test';
import { ConfigReader } from './utils/configReader';

// EN: Resolve URLs/env once for the config. / TR: URL/ortamı config için bir kez çöz.
const config = ConfigReader.getInstance();

/**
 * EN: Central Playwright configuration.
 *   - A `setup` project authenticates once; every browser project depends on it, so the
 *     authenticated storageState exists before the suite runs (see tests/hooks/hooks.ts).
 *   - `retries` only on CI so local runs fail fast and surface flakiness early.
 *   - On CI a `blob` reporter is emitted per shard; a merge job stitches shards into one HTML.
 *   - Cross-browser projects prove the framework is browser-agnostic.
 * TR: Merkezi Playwright yapılandırması.
 *   - Bir `setup` projesi bir kez kimlik doğrular; her tarayıcı projesi ona bağlıdır, böylece
 *     kimliği doğrulanmış storageState suite çalışmadan önce hazır olur (bkz. tests/hooks/hooks.ts).
 *   - `retries` yalnız CI'da; yerel koşular hızlı fail olup kırılganlığı erken gösterir.
 *   - CI'da shard başına `blob` raporlayıcı üretilir; bir merge job shard'ları tek HTML'e diker.
 *   - Çapraz-tarayıcı projeleri, framework'ün tarayıcıdan bağımsız olduğunu kanıtlar.
 */
export default defineConfig({
  // EN: Where specs live. / TR: Spec'lerin bulunduğu yer.
  testDir: './tests',
  // EN: Run tests within a file in parallel. / TR: Bir dosya içindeki testleri paralel çalıştır.
  fullyParallel: true,
  // EN: Fail CI if a test.only was left in. / TR: Kodda test.only kaldıysa CI'yı fail et.
  forbidOnly: !!process.env.CI,
  // EN: Retry only on CI. / TR: Yalnız CI'da yeniden dene.
  retries: process.env.CI ? 2 : 0,
  // EN: Cap workers on CI for stable resource use. / TR: Kararlı kaynak kullanımı için CI'da worker sınırı.
  workers: process.env.CI ? 2 : undefined,

  // EN: JSON is always emitted so the Excel/PDF exporters and email script have a source.
  // TR: JSON her zaman üretilir; Excel/PDF dışa aktarıcıları ve e-posta scripti için kaynak olur.
  reporter: process.env.CI
    ? [['blob'], ['json', { outputFile: 'test-results/results.json' }], ['list']]
    : [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
      ],

  use: {
    // EN: Base URL for page.goto('/...'). / TR: page.goto('/...') için temel URL.
    baseURL: config.uiBaseUrl,
    // EN: Capture a trace on the first retry only. / TR: Yalnız ilk yeniden denemede trace al.
    trace: 'on-first-retry',
    // EN: Screenshot only when a test fails. / TR: Yalnız test başarısız olunca ekran görüntüsü.
    screenshot: 'only-on-failure',
    // EN: No video (keeps artifacts small). / TR: Video yok (dosyaları küçük tutar).
    video: 'off',
  },

  projects: [
    // EN: Runs first; logs in and saves storageState. / TR: İlk çalışır; giriş yapar ve storageState kaydeder.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // EN: Browser projects depend on setup. / TR: Tarayıcı projeleri setup'a bağlıdır.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
});
