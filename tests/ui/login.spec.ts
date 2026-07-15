import { test, expect } from '../hooks/hooks';
import { USERS } from '../../utils/constants';

/**
 * EN: Positive login. @Login → the hooks layer gives this test a clean, unauthenticated context.
 * TR: Başarılı giriş. @Login → hooks katmanı bu teste temiz, kimliksiz bir context verir.
 */
test.describe('Login', () => {
  test(
    'logs in successfully with valid credentials',
    { tag: ['@Login', '@smoke'] },
    async ({ loginPage, inventoryPage, page }) => {
      // EN: Submit valid credentials. / TR: Geçerli bilgileri gönder.
      await test.step('open the login page and submit valid credentials', async () => {
        await loginPage.open();
        await loginPage.login(USERS.standard.username, USERS.standard.password);
      });

      // EN: Verify we reached the inventory page. / TR: Envanter sayfasına ulaştığımızı doğrula.
      await test.step('lands on the inventory page', async () => {
        await expect(page).toHaveURL(/inventory\.html/);
        await inventoryPage.expectLoaded();
      });
    },
  );
});
