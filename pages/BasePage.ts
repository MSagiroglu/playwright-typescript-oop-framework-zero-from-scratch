import type { Page } from '@playwright/test';
import { ReusableMethods } from '../utils/reusableMethods';

/**
 * EN: Abstract base for every Page Object. Demonstrates OOP: abstraction (small surface over
 *     raw Playwright), encapsulation (protected page/reusable), inheritance (pages extend this
 *     and only add their own path + locators).
 * TR: Her Page Object'in soyut tabanı. OOP'yi gösterir: soyutlama (ham Playwright üzerinde küçük
 *     bir yüzey), kapsülleme (protected page/reusable), kalıtım (sayfalar bunu genişletir ve
 *     yalnız kendi path + locator'larını ekler).
 */
export abstract class BasePage {
  // EN: The Playwright page (hidden from specs). / TR: Playwright sayfası (spec'lerden gizli).
  protected readonly page: Page;
  // EN: The shared interaction wrapper. / TR: Paylaşılan etkileşim sarmalayıcısı.
  protected readonly reusable: ReusableMethods;

  // EN: Route this page lives at, relative to baseURL. / TR: Bu sayfanın baseURL'e göre yolu.
  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
    this.reusable = new ReusableMethods(page);
  }

  // EN: Navigate to this page using the project's baseURL. / TR: Projenin baseURL'ini kullanarak bu sayfaya git.
  async open(): Promise<void> {
    await this.reusable.goto(this.path);
  }

  // EN: Current page URL (for URL assertions in specs). / TR: Mevcut sayfa URL'i (spec'lerdeki URL doğrulamaları için).
  url(): string {
    return this.page.url();
  }
}
