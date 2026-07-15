import { test } from '../hooks/hooks';
import { PRODUCTS } from '../../utils/constants';
import { generateCheckoutInfo } from '../../utils/data-generator';

/**
 * EN: End-to-end checkout — the business-critical flow. @critical.
 * TR: Uçtan-uca ödeme — iş açısından kritik akış. @critical.
 */
test.describe('Checkout', () => {
  test(
    'completes an end-to-end purchase',
    { tag: ['@critical'] },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      // EN: Random valid shipping data per run. / TR: Her koşuda rastgele geçerli kargo verisi.
      const shippingInfo = generateCheckoutInfo();

      // EN: Add two products. / TR: İki ürün ekle.
      await test.step('add two products to the cart', async () => {
        await inventoryPage.open();
        await inventoryPage.expectLoaded();
        await inventoryPage.addItemToCart(PRODUCTS.backpack);
        await inventoryPage.addItemToCart(PRODUCTS.bikeLight);
      });

      // EN: Move from cart into checkout. / TR: Sepetten ödemeye geç.
      await test.step('proceed from cart to checkout', async () => {
        await inventoryPage.openCart();
        await cartPage.proceedToCheckout();
      });

      // EN: Fill info and place the order. / TR: Bilgileri doldur ve siparişi ver.
      await test.step('fill shipping info and place the order', async () => {
        await checkoutPage.fillShippingInfo(shippingInfo);
        await checkoutPage.placeOrder();
      });

      // EN: Confirm the order completed. / TR: Siparişin tamamlandığını doğrula.
      await test.step('the order confirmation is shown', async () => {
        await checkoutPage.expectOrderComplete();
      });
    },
  );
});
