import { test, expect } from '../hooks/hooks';
import { PRODUCTS } from '../../utils/constants';

/**
 * EN: Cart. No @Login tag → the hooks layer injects an already-authenticated session.
 * TR: Sepet. @Login tag yok → hooks katmanı zaten kimliği doğrulanmış bir oturum enjekte eder.
 */
test.describe('Cart', () => {
  test(
    'adds an item and reflects the count on the cart badge',
    { tag: ['@smoke'] },
    async ({ inventoryPage, cartPage }) => {
      // EN: Start on inventory; cart should be empty. / TR: Envanterle başla; sepet boş olmalı.
      await test.step('open the inventory as an authenticated user', async () => {
        await inventoryPage.open();
        await inventoryPage.expectLoaded();
        expect(await inventoryPage.getCartBadgeCount()).toBe(0);
      });

      // EN: Add a product; badge becomes 1. / TR: Bir ürün ekle; rozet 1 olur.
      await test.step('add a product and verify the badge increments', async () => {
        await inventoryPage.addItemToCart(PRODUCTS.backpack);
        expect(await inventoryPage.getCartBadgeCount()).toBe(1);
      });

      // EN: Product appears on the cart page. / TR: Ürün sepet sayfasında görünür.
      await test.step('the product is listed on the cart page', async () => {
        await inventoryPage.openCart();
        await cartPage.expectItemPresent(PRODUCTS.backpack);
        expect(await cartPage.getItemCount()).toBe(1);
      });
    },
  );
});
