import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CheckoutInfo } from '../utils/data-generator';

/**
 * EN: Page Object for the multi-step checkout (info → overview → complete).
 * TR: Çok-adımlı ödeme için Page Object (bilgi → özet → tamamlandı).
 */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  private readonly firstNameInput: Locator; // EN: first name / TR: ad
  private readonly lastNameInput: Locator; // EN: last name / TR: soyad
  private readonly postalCodeInput: Locator; // EN: postal code / TR: posta kodu
  private readonly continueButton: Locator; // EN: continue to overview / TR: özete devam et
  private readonly finishButton: Locator; // EN: place order / TR: siparişi tamamla
  private readonly summaryTotal: Locator; // EN: order total label / TR: sipariş toplamı etiketi
  private readonly completeHeader: Locator; // EN: confirmation header / TR: onay başlığı

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.summaryTotal = page.locator('[data-test="total-label"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  // EN: Fill shipping info and advance to the order summary. / TR: Kargo bilgisini doldur ve sipariş özetine geç.
  async fillShippingInfo(info: CheckoutInfo): Promise<void> {
    await this.reusable.fill(this.firstNameInput, info.firstName);
    await this.reusable.fill(this.lastNameInput, info.lastName);
    await this.reusable.fill(this.postalCodeInput, info.postalCode);
    await this.reusable.click(this.continueButton);
  }

  // EN: Assert a total is shown, then place the order. / TR: Bir toplamın gösterildiğini doğrula, sonra siparişi ver.
  async placeOrder(): Promise<void> {
    await this.reusable.expectVisible(this.summaryTotal);
    await this.reusable.click(this.finishButton);
  }

  // EN: Assert the order-confirmation page is shown. / TR: Sipariş-onay sayfasının gösterildiğini doğrula.
  async expectOrderComplete(): Promise<void> {
    await this.reusable.expectText(this.completeHeader, 'Thank you for your order!');
  }
}
