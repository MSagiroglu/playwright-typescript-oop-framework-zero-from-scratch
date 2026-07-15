/**
 * EN: Environment-aware configuration (singleton). Named environments live in one map,
 *     `TEST_ENV` selects one, and individual values can still be overridden by env vars —
 *     so CI and local both work with zero edits. Defaults to public demo targets only.
 * TR: Ortama duyarlı yapılandırma (singleton). İsimli ortamlar tek bir haritada durur,
 *     `TEST_ENV` birini seçer, tekil değerler yine env değişkenleriyle ezilebilir — böylece
 *     CI ve lokal, hiçbir düzenleme olmadan çalışır. Varsayılanlar yalnızca public demo hedefleri.
 */

// EN: Allowed environment names. / TR: İzin verilen ortam adları.
export type EnvName = 'demo';

// EN: Shape of one environment's config. / TR: Bir ortamın yapılandırma şekli.
interface EnvironmentConfig {
  readonly uiBaseUrl: string;
  readonly apiBaseUrl: string;
}

// EN: The single map of environments — add more here without touching any test.
// TR: Tek ortam haritası — buraya yenisini ekle, hiçbir teste dokunmadan.
const ENVIRONMENTS: Record<EnvName, EnvironmentConfig> = {
  demo: {
    uiBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  },
};

export class ConfigReader {
  // EN: Cached single instance. / TR: Önbelleğe alınmış tek örnek.
  private static instance: ConfigReader | undefined;
  // EN: Resolved config for this run. / TR: Bu koşu için çözümlenmiş yapılandırma.
  private readonly config: EnvironmentConfig;
  // EN: Active environment name. / TR: Aktif ortam adı.
  readonly envName: EnvName;

  // EN: Private so callers must use getInstance(). / TR: Private; çağıranlar getInstance() kullanmalı.
  private constructor() {
    // EN: Use TEST_ENV if it names a known environment, else fall back to 'demo'.
    // TR: TEST_ENV bilinen bir ortamı gösteriyorsa onu kullan, aksi halde 'demo'a düş.
    this.envName =
      (process.env.TEST_ENV as EnvName) in ENVIRONMENTS
        ? (process.env.TEST_ENV as EnvName)
        : 'demo';

    const base = ENVIRONMENTS[this.envName];
    // EN: Per-value env overrides win over the environment defaults.
    // TR: Tekil env override'ları, ortam varsayılanlarını geçersiz kılar.
    this.config = {
      uiBaseUrl: process.env.BASE_URL ?? base.uiBaseUrl,
      apiBaseUrl: process.env.API_BASE_URL ?? base.apiBaseUrl,
    };
  }

  // EN: Lazily create and return the shared instance. / TR: Paylaşılan örneği tembelce oluştur ve döndür.
  static getInstance(): ConfigReader {
    if (!ConfigReader.instance) {
      ConfigReader.instance = new ConfigReader();
    }
    return ConfigReader.instance;
  }

  // EN: Base URL of the UI under test. / TR: Test edilen arayüzün temel URL'i.
  get uiBaseUrl(): string {
    return this.config.uiBaseUrl;
  }

  // EN: Base URL of the API under test. / TR: Test edilen API'nin temel URL'i.
  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }
}
