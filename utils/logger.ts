/**
 * EN: Structured console logger. Every line carries a timestamp, an optional context
 *     (usually the browser name), an emoji describing the status/action, and a level.
 *     Example: `[2026-01-01T00:00:00.000Z] [chromium] 🖱️ ACTION: Clicked "Login" <button>`
 * TR: Yapılandırılmış konsol logger'ı. Her satır bir zaman damgası, isteğe bağlı bir bağlam
 *     (genelde tarayıcı adı), durumu/aksiyonu anlatan bir emoji ve bir seviye taşır.
 *     Örnek: `[2026-01-01T00:00:00.000Z] [chromium] 🖱️ ACTION: Clicked "Login" <button>`
 *
 * EN: Set PW_QUIET=1 to silence info/action noise (errors/warnings still print).
 * TR: info/action gürültüsünü susturmak için PW_QUIET=1 (hata/uyarı yine yazılır).
 */

// EN: ISO timestamp for every line. / TR: Her satır için ISO zaman damgası.
function timestamp(): string {
  return new Date().toISOString();
}

// EN: Whether low-priority logs are suppressed. / TR: Düşük öncelikli logların susturulup susturulmadığı.
function quiet(): boolean {
  return process.env.PW_QUIET === '1';
}

export class Logger {
  // EN: Context tag (browser name, "setup", etc.). / TR: Bağlam etiketi (tarayıcı adı, "setup" vb.).
  constructor(private readonly context?: string) {}

  // EN: Build one formatted line. / TR: Biçimlendirilmiş tek satır oluştur.
  private line(emoji: string, level: string, message: string): string {
    const ctx = this.context ? ` [${this.context}]` : '';
    return `[${timestamp()}]${ctx} ${emoji} ${level}: ${message}`;
  }

  // EN: General information. / TR: Genel bilgi.
  info(message: string): void {
    if (!quiet()) console.log(this.line('ℹ️', 'INFO', message));
  }

  // EN: A test/step started. / TR: Bir test/adım başladı.
  start(message: string): void {
    if (!quiet()) console.log(this.line('▶️', 'START', message));
  }

  // EN: A test/step passed. / TR: Bir test/adım geçti.
  success(message: string): void {
    if (!quiet()) console.log(this.line('✅', 'PASS', message));
  }

  // EN: A test was skipped. / TR: Bir test atlandı.
  skip(message: string): void {
    if (!quiet()) console.log(this.line('⏭️', 'SKIP', message));
  }

  // EN: Cleanup activity. / TR: Temizlik faaliyeti.
  cleanup(message: string): void {
    if (!quiet()) console.log(this.line('🧹', 'CLEANUP', message));
  }

  // EN: An element interaction, with a caller-supplied emoji. / TR: Çağıranın verdiği emoji ile bir öğe etkileşimi.
  action(emoji: string, message: string): void {
    if (!quiet()) console.log(this.line(emoji, 'ACTION', message));
  }

  // EN: A warning (always printed). / TR: Bir uyarı (her zaman yazılır).
  warn(message: string): void {
    console.warn(this.line('⚠️', 'WARN', message));
  }

  // EN: A failure/error (always printed). / TR: Bir başarısızlık/hata (her zaman yazılır).
  error(message: string): void {
    console.error(this.line('❌', 'FAIL', message));
  }
}

// EN: Default context-less logger for scripts and hooks. / TR: Scriptler ve hook'lar için bağlamsız varsayılan logger.
export const logger = new Logger();
