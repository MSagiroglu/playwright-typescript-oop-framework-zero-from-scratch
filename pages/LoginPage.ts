import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * EN: Page Object for the saucedemo login page.
 * TR: saucedemo login sayfası için Page Object.
 */
export class LoginPage extends BasePage {
  // EN: Login lives at the site root. / TR: Login sitenin kök yolundadır.
  protected readonly path = '/';

  // EN: Username field. / TR: Kullanıcı adı alanı.
  private readonly usernameInput: Locator;
  // EN: Password field. / TR: Şifre alanı.
  private readonly passwordInput: Locator;
  // EN: Login button. / TR: Giriş butonu.
  private readonly loginButton: Locator;
  // EN: Inline error banner. / TR: Satır-içi hata bandı.
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // EN: Bind locators to stable data-test attributes. / TR: Locator'ları kararlı data-test attribute'larına bağla.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // EN: Fill credentials and submit the form. / TR: Bilgileri gir ve formu gönder.
  async login(username: string, password: string): Promise<void> {
    await this.reusable.fill(this.usernameInput, username);
    await this.reusable.fill(this.passwordInput, password);
    await this.reusable.click(this.loginButton);
  }

  // EN: Assert the error banner contains the expected text. / TR: Hata bandının beklenen metni içerdiğini doğrula.
  async expectErrorMessage(expected: string): Promise<void> {
    await this.reusable.expectVisible(this.errorMessage);
    await this.reusable.expectText(this.errorMessage, expected);
  }
}
