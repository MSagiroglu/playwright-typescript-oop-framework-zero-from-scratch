import { test, expect } from '../hooks/hooks';
import { SORT_OPTIONS } from '../../utils/constants';

/**
 * EN: Product sorting — verifies the UI ordering matches a locally computed expected order.
 * TR: Ürün sıralaması — UI sırasının, yerel hesaplanan beklenen sırayla eşleştiğini doğrular.
 */
test.describe('Product sorting', () => {
  test('sorts products by name Z→A', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.open();
    await inventoryPage.expectLoaded();
    await inventoryPage.sortBy(SORT_OPTIONS.nameDesc);

    // EN: Compare against names sorted then reversed. / TR: Adları sıralayıp ters çevirerek karşılaştır.
    const names = await inventoryPage.getProductNames();
    const expected = [...names].sort().reverse();
    expect(names).toEqual(expected);
  });

  test('sorts products by price low→high', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.open();
    await inventoryPage.expectLoaded();
    await inventoryPage.sortBy(SORT_OPTIONS.priceAsc);

    // EN: Compare against numerically ascending prices. / TR: Sayısal artan fiyatlarla karşılaştır.
    const prices = await inventoryPage.getProductPrices();
    const expected = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(expected);
  });
});
