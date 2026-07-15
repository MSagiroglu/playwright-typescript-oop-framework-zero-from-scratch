import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * EN: Page Object for the products/inventory page.
 * TR: Ürünler/envanter sayfası için Page Object.
 */
export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  private readonly title: Locator; // EN: page title / TR: sayfa başlığı
  private readonly cartBadge: Locator; // EN: cart count badge / TR: sepet sayaç rozeti
  private readonly cartLink: Locator; // EN: cart icon link / TR: sepet ikonu bağlantısı
  private readonly sortDropdown: Locator; // EN: sort selector / TR: sıralama seçici
  private readonly itemNames: Locator; // EN: all product names / TR: tüm ürün adları
  private readonly itemPrices: Locator; // EN: all product prices / TR: tüm ürün fiyatları

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
  }

  // EN: Assert the inventory page has loaded. / TR: Envanter sayfasının yüklendiğini doğrula.
  async expectLoaded(): Promise<void> {
    await this.reusable.expectText(this.title, 'Products');
  }

  // EN: Add a product to the cart by its visible name. / TR: Görünen adına göre bir ürünü sepete ekle.
  async addItemToCart(productName: string): Promise<void> {
    // EN: Scope to the item card that contains the name, then click its "Add to cart".
    // TR: Adı içeren ürün kartına daral, sonra onun "Add to cart" butonuna tıkla.
    const item = this.page.locator('[data-test="inventory-item"]').filter({ hasText: productName });
    await this.reusable.click(item.getByRole('button', { name: 'Add to cart' }));
  }

  // EN: Cart badge count (0 when badge is absent). / TR: Sepet rozet sayısı (rozet yoksa 0).
  async getCartBadgeCount(): Promise<number> {
    if ((await this.reusable.count(this.cartBadge)) === 0) {
      return 0;
    }
    return Number(await this.reusable.getText(this.cartBadge));
  }

  // EN: Open the cart page. / TR: Sepet sayfasını aç.
  async openCart(): Promise<void> {
    await this.reusable.click(this.cartLink);
  }

  // EN: Sort products by the given option value. / TR: Ürünleri verilen seçenek değerine göre sırala.
  async sortBy(optionValue: string): Promise<void> {
    await this.reusable.selectOption(this.sortDropdown, optionValue);
  }

  // EN: Product names in display order. / TR: Görüntülenme sırasına göre ürün adları.
  async getProductNames(): Promise<string[]> {
    return this.reusable.getAllTexts(this.itemNames);
  }

  // EN: Product prices as numbers (strips the "$"). / TR: Ürün fiyatlarını sayı olarak ("$" atılır).
  async getProductPrices(): Promise<number[]> {
    const raw = await this.reusable.getAllTexts(this.itemPrices);
    return raw.map((price) => Number(price.replace('$', '')));
  }
}
