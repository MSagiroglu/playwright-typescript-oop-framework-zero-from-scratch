import {
  expect,
  type Dialog,
  type FrameLocator,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';
import { Logger } from './logger';

/**
 * EN: Reusable interaction layer shared by every Page Object. Page methods stay declarative
 *     and every action funnels through one place — so waits, retries and logging are defined
 *     once. Every element action logs what it did, on which element, in which browser, with a
 *     timestamp and a status emoji. All waits are web-first (auto-retrying); tests/pages use
 *     no hard waits (a `waitForTimeout` helper exists only as a documented last resort).
 * TR: Her Page Object'in paylaştığı yeniden-kullanılabilir etkileşim katmanı. Sayfa metotları
 *     bildirimsel kalır ve her aksiyon tek noktadan geçer — böylece bekleme, retry ve loglama
 *     tek yerde tanımlanır. Her öğe aksiyonu; ne yaptığını, hangi öğe üzerinde, hangi tarayıcıda,
 *     zaman damgası ve durum emoji'siyle loglar. Tüm beklemeler web-first'tür; testler/sayfalar
 *     sabit bekleme kullanmaz (`waitForTimeout` yalnız belgelenmiş son-çare olarak vardır).
 */
export class ReusableMethods {
  private readonly page: Page;
  // EN: Logger tagged with the browser name. / TR: Tarayıcı adıyla etiketlenmiş logger.
  private readonly log: Logger;

  constructor(page: Page) {
    this.page = page;
    // EN: Derive the browser name (chromium/firefox/webkit) for log context.
    // TR: Log bağlamı için tarayıcı adını (chromium/firefox/webkit) türet.
    const browser = page.context().browser();
    this.log = new Logger(browser ? browser.browserType().name() : 'browser');
  }

  /**
   * EN: Build a short human description of a locator ("text" <tag>) for logs.
   * TR: Loglar için bir locator'ın kısa insan-okur tarifini oluştur ("text" <tag>).
   */
  private async describeElement(locator: Locator): Promise<string> {
    try {
      const info = await locator.first().evaluate((el: Element) => {
        const node = el as HTMLElement & { placeholder?: string; value?: string };
        const clean = (v: string | null | undefined) => (v || '').replace(/\s+/g, ' ').trim();
        return {
          tag: node.tagName ? node.tagName.toLowerCase() : '',
          text: clean(node.textContent),
          aria: clean(node.getAttribute('aria-label')),
          placeholder: clean(node.placeholder),
          name: clean(node.getAttribute('name')),
          id: clean(node.id),
        };
      });
      const label = info.text || info.aria || info.placeholder || info.name || info.id;
      const trimmed = (label || '').slice(0, 50);
      return trimmed ? `"${trimmed}" <${info.tag}>` : `<${info.tag || 'element'}>`;
    } catch {
      // EN: Element may be gone/detached — fall back to a generic label. / TR: Öğe kaybolmuş olabilir — genel etikete düş.
      return '<element>';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EN: Navigation / TR: Gezinme
  // ─────────────────────────────────────────────────────────────────────────────

  // EN: Go to a URL. / TR: Bir URL'e git.
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    this.log.action('🌐', `Navigated to ${url}`);
  }

  // EN: Alias of goto (matches common naming). / TR: goto takma adı (yaygın adlandırmaya uyar).
  async navigateTo(url: string): Promise<void> {
    await this.goto(url);
  }

  // EN: Reload the current page. / TR: Mevcut sayfayı yenile.
  async reload(): Promise<void> {
    await this.page.reload();
    this.log.action('🔄', 'Reloaded the page');
  }

  // EN: Navigate back. / TR: Geri git.
  async goBack(): Promise<void> {
    await this.page.goBack();
    this.log.action('⬅️', 'Navigated back');
  }

  // EN: Navigate forward. / TR: İleri git.
  async goForward(): Promise<void> {
    await this.page.goForward();
    this.log.action('➡️', 'Navigated forward');
  }

  // EN: Current page URL. / TR: Mevcut sayfa URL'i.
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // EN: Current page title. / TR: Mevcut sayfa başlığı.
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  // EN: Wait until the URL matches. / TR: URL eşleşene kadar bekle.
  async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
    this.log.action('🧭', `URL matched ${url}`);
  }

  // EN: Wait until the DOM is loaded. / TR: DOM yüklenene kadar bekle.
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // EN: Wait until the network is idle. / TR: Ağ boşa çıkana kadar bekle.
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EN: Element actions / TR: Öğe aksiyonları
  // ─────────────────────────────────────────────────────────────────────────────

  // EN: Wait for visibility, then click. / TR: Görünürlüğü bekle, sonra tıkla.
  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.click();
    this.log.action('🖱️', `Clicked ${desc}`);
  }

  // EN: Force-click (bypasses actionability checks). / TR: Zorla tıkla (aksiyon-edilebilirlik kontrollerini atlar).
  async clickForce(locator: Locator): Promise<void> {
    const desc = await this.describeElement(locator);
    await locator.click({ force: true });
    this.log.action('🖱️', `Force-clicked ${desc}`);
  }

  // EN: Double-click. / TR: Çift tıkla.
  async doubleClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.dblclick();
    this.log.action('🖱️', `Double-clicked ${desc}`);
  }

  // EN: Right-click (context menu). / TR: Sağ tıkla (bağlam menüsü).
  async rightClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.click({ button: 'right' });
    this.log.action('🖱️', `Right-clicked ${desc}`);
  }

  // EN: Hover over an element. / TR: Bir öğenin üzerine gel.
  async hover(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.hover();
    this.log.action('🕹️', `Hovered ${desc}`);
  }

  // EN: Focus an element. / TR: Bir öğeye odaklan.
  async focus(locator: Locator): Promise<void> {
    await locator.focus();
    this.log.action('🎯', `Focused ${await this.describeElement(locator)}`);
  }

  // EN: Blur (remove focus). / TR: Odağı kaldır.
  async blur(locator: Locator): Promise<void> {
    await locator.blur();
    this.log.action('😶‍🌫️', `Blurred ${await this.describeElement(locator)}`);
  }

  // EN: Fill an input (clears first). / TR: Bir input'u doldur (önce temizler).
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.fill(value);
    this.log.action('⌨️', `Filled ${desc} with "${value}"`);
  }

  // EN: Clear then fill (explicit). / TR: Temizle sonra doldur (açık).
  async clearAndFill(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await this.fill(locator, value);
  }

  // EN: Type character by character. / TR: Karakter karakter yaz.
  async type(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.pressSequentially(value);
    this.log.action('⌨️', `Typed "${value}" into ${desc}`);
  }

  // EN: Clear an input. / TR: Bir input'u temizle.
  async clear(locator: Locator): Promise<void> {
    await locator.clear();
    this.log.action('🧽', `Cleared ${await this.describeElement(locator)}`);
  }

  // EN: Press a keyboard key globally. / TR: Global bir klavye tuşuna bas.
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
    this.log.action('⌨️', `Pressed key "${key}"`);
  }

  // EN: Press a key on a specific element. / TR: Belirli bir öğe üzerinde tuşa bas.
  async pressKeyOnElement(locator: Locator, key: string): Promise<void> {
    await locator.press(key);
    this.log.action('⌨️', `Pressed "${key}" on ${await this.describeElement(locator)}`);
  }

  // EN: Check a checkbox/radio. / TR: Bir checkbox/radio işaretle.
  async check(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.check();
    this.log.action('☑️', `Checked ${desc}`);
  }

  // EN: Uncheck a checkbox. / TR: Bir checkbox'ın işaretini kaldır.
  async uncheck(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.uncheck();
    this.log.action('◻️', `Unchecked ${desc}`);
  }

  // EN: Select a dropdown option by value. / TR: Açılır menüden değere göre seç.
  async selectOption(locator: Locator, value: string): Promise<void> {
    await this.selectByValue(locator, value);
  }

  // EN: Select by option value. / TR: Seçenek değerine göre seç.
  async selectByValue(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.selectOption({ value });
    this.log.action('🔽', `Selected value "${value}" on ${desc}`);
  }

  // EN: Select by visible label. / TR: Görünen etikete göre seç.
  async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.selectOption({ label });
    this.log.action('🔽', `Selected label "${label}" on ${desc}`);
  }

  // EN: Select by index. / TR: İndekse göre seç.
  async selectByIndex(locator: Locator, index: number): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    const desc = await this.describeElement(locator);
    await locator.selectOption({ index });
    this.log.action('🔽', `Selected index ${index} on ${desc}`);
  }

  // EN: Set file input(s) for upload. / TR: Yükleme için dosya input(lar)ını ayarla.
  async uploadFile(locator: Locator, filePath: string | string[]): Promise<void> {
    await locator.setInputFiles(filePath);
    this.log.action('📎', `Uploaded ${Array.isArray(filePath) ? filePath.length : 1} file(s)`);
  }

  // EN: Scroll an element into view. / TR: Bir öğeyi görünür alana kaydır.
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    this.log.action('📜', `Scrolled to ${await this.describeElement(locator)}`);
  }

  // EN: Scroll to the top of the page. / TR: Sayfanın en üstüne kaydır.
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    this.log.action('📜', 'Scrolled to top');
  }

  // EN: Scroll to the bottom of the page. / TR: Sayfanın en altına kaydır.
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    this.log.action('📜', 'Scrolled to bottom');
  }

  // EN: Trigger and capture a download; returns the suggested filename.
  // TR: Bir indirmeyi tetikle ve yakala; önerilen dosya adını döndürür.
  async downloadFile(trigger: () => Promise<void>): Promise<string> {
    const [download] = await Promise.all([this.page.waitForEvent('download'), trigger()]);
    const name = download.suggestedFilename();
    this.log.action('📥', `Downloaded "${name}"`);
    return name;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EN: Queries / TR: Sorgular
  // ─────────────────────────────────────────────────────────────────────────────

  // EN: Trimmed text of an element. / TR: Bir öğenin kırpılmış metni.
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent())?.trim() ?? '';
  }

  // EN: innerText of an element. / TR: Bir öğenin innerText'i.
  async getInnerText(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }

  // EN: Text of all matching elements. / TR: Eşleşen tüm öğelerin metni.
  async getAllTexts(locator: Locator): Promise<string[]> {
    return locator.allTextContents();
  }

  // EN: An attribute value. / TR: Bir attribute değeri.
  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }

  // EN: Current value of an input. / TR: Bir input'un mevcut değeri.
  async getValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  // EN: Alias of getValue. / TR: getValue takma adı.
  async getInputValue(locator: Locator): Promise<string> {
    return this.getValue(locator);
  }

  // EN: Number of matching elements. / TR: Eşleşen öğe sayısı.
  async count(locator: Locator): Promise<number> {
    return locator.count();
  }

  // EN: Whether an element is visible now. / TR: Bir öğe şu an görünür mü.
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  // EN: Whether an element is enabled now. / TR: Bir öğe şu an etkin mi.
  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  // EN: Whether an element is disabled now. / TR: Bir öğe şu an devre dışı mı.
  async isDisabled(locator: Locator): Promise<boolean> {
    return locator.isDisabled();
  }

  // EN: Whether a checkbox is checked. / TR: Bir checkbox işaretli mi.
  async isChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }

  // EN: Whether an input is editable. / TR: Bir input düzenlenebilir mi.
  async isEditable(locator: Locator): Promise<boolean> {
    return locator.isEditable();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EN: Waits / TR: Beklemeler
  // ─────────────────────────────────────────────────────────────────────────────

  // EN: Wait until visible. / TR: Görünür olana kadar bekle.
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  // EN: Wait until hidden. / TR: Gizlenene kadar bekle.
  async waitForHidden(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'hidden' });
  }

  // EN: Fixed wait — DISCOURAGED last resort; no test/page uses it (prefer web-first waits).
  // TR: Sabit bekleme — ÖNERİLMEZ son çare; hiçbir test/sayfa kullanmaz (web-first tercih edin).
  async waitForTimeout(ms: number): Promise<void> {
    this.log.warn(`Hard wait of ${ms}ms — avoid in favour of web-first waits.`);
    await this.page.waitForTimeout(ms);
  }

  // EN: Wait for a matching network response. / TR: Eşleşen bir ağ yanıtını bekle.
  async waitForResponse(urlPart: string | RegExp): Promise<Response> {
    return this.page.waitForResponse(urlPart);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EN: Assertions (action + verification) / TR: Doğrulamalar
  // ─────────────────────────────────────────────────────────────────────────────

  // EN: Assert visible. / TR: Görünür olduğunu doğrula.
  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    this.log.action('🔍', `Verified visible: ${await this.describeElement(locator)}`);
  }

  // EN: Assert hidden. / TR: Gizli olduğunu doğrula.
  async expectHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
    this.log.action('🔍', 'Verified hidden');
  }

  // EN: Assert element contains text. / TR: Öğenin metni içerdiğini doğrula.
  async expectText(locator: Locator, expected: string | RegExp): Promise<void> {
    await expect(locator).toContainText(expected);
    this.log.action('🔍', `Verified text contains "${expected}"`);
  }

  // EN: Assert exact text. / TR: Tam metni doğrula.
  async expectExactText(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveText(expected);
    this.log.action('🔍', `Verified exact text "${expected}"`);
  }

  // EN: Assert input value. / TR: Input değerini doğrula.
  async expectValue(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveValue(expected);
    this.log.action('🔍', `Verified value "${expected}"`);
  }

  // EN: Assert element count. / TR: Öğe sayısını doğrula.
  async expectCount(locator: Locator, expected: number): Promise<void> {
    await expect(locator).toHaveCount(expected);
    this.log.action('🔍', `Verified count = ${expected}`);
  }

  // EN: Assert enabled. / TR: Etkin olduğunu doğrula.
  async expectEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
    this.log.action('🔍', 'Verified enabled');
  }

  // EN: Assert disabled. / TR: Devre dışı olduğunu doğrula.
  async expectDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
    this.log.action('🔍', 'Verified disabled');
  }

  // EN: Assert checked. / TR: İşaretli olduğunu doğrula.
  async expectChecked(locator: Locator): Promise<void> {
    await expect(locator).toBeChecked();
    this.log.action('🔍', 'Verified checked');
  }

  // EN: Assert the page URL matches. / TR: Sayfa URL'inin eşleştiğini doğrula.
  async expectUrl(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
    this.log.action('🔍', `Verified URL ${url}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EN: Advanced / TR: Gelişmiş
  // ─────────────────────────────────────────────────────────────────────────────

  // EN: Run JS in the page and return the result. / TR: Sayfada JS çalıştır ve sonucu döndür.
  async executeScript<T>(fn: (arg?: unknown) => T, arg?: unknown): Promise<T> {
    return this.page.evaluate(fn, arg);
  }

  // EN: Take a screenshot into test-results/. / TR: test-results/ içine ekran görüntüsü al.
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
    this.log.action('📸', `Saved screenshot "${name}.png"`);
  }

  // EN: Return a FrameLocator for an iframe. / TR: Bir iframe için FrameLocator döndür.
  switchToFrame(frameLocator: string): FrameLocator {
    return this.page.frameLocator(frameLocator);
  }

  // EN: Auto-accept the next dialog. / TR: Sonraki diyaloğu otomatik kabul et.
  async acceptDialog(): Promise<void> {
    this.page.once('dialog', (dialog: Dialog) => {
      this.log.action('✔️', `Accepted dialog: "${dialog.message()}"`);
      void dialog.accept();
    });
  }

  // EN: Auto-dismiss the next dialog. / TR: Sonraki diyaloğu otomatik reddet.
  async dismissDialog(): Promise<void> {
    this.page.once('dialog', (dialog: Dialog) => {
      this.log.action('✖️', `Dismissed dialog: "${dialog.message()}"`);
      void dialog.dismiss();
    });
  }

  // EN: Read a localStorage value. / TR: Bir localStorage değerini oku.
  async getLocalStorage(key: string): Promise<string | null> {
    return this.page.evaluate((k) => window.localStorage.getItem(k), key);
  }

  // EN: Write a localStorage value. / TR: Bir localStorage değeri yaz.
  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [key, value]);
  }
}
