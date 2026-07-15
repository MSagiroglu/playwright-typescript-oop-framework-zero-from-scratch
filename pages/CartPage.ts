import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * EN: Page Object for the cart page.
 * TR: Sepet sayfası için Page Object.
 */
export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  private readonly cartItems: Locator; // EN: item rows / TR: ürün satırları
  private readonly itemNames: Locator; // EN: item names / TR: ürün adları
  private readonly checkoutButton: Locator; // EN: checkout button / TR: ödeme butonu

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // EN: Number of items in the cart. / TR: Sepetteki ürün sayısı.
  async getItemCount(): Promise<number> {
    return this.reusable.count(this.cartItems);
  }

  // EN: Names of items in the cart. / TR: Sepetteki ürünlerin adları.
  async getItemNames(): Promise<string[]> {
    return this.reusable.getAllTexts(this.itemNames);
  }

  // EN: Assert a product is present in the cart. / TR: Bir ürünün sepette olduğunu doğrula.
  async expectItemPresent(productName: string): Promise<void> {
    await this.reusable.expectVisible(this.itemNames.filter({ hasText: productName }));
  }

  // EN: Proceed to the checkout flow. / TR: Ödeme akışına geç.
  async proceedToCheckout(): Promise<void> {
    await this.reusable.click(this.checkoutButton);
  }
}
