import { test, expect } from '../hooks/hooks';
import path from 'node:path';
import { readRows } from '../../utils/excel/excelHelper';

/**
 * EN: Data-driven from Excel: scenarios are read at runtime from login-scenarios.xlsx
 *     (regenerate with `npm run generate:data`). Each row is verified as its own step.
 *     @Login → clean, unauthenticated context.
 * TR: Excel'den veri-güdümlü: senaryolar çalışma anında login-scenarios.xlsx'ten okunur
 *     (`npm run generate:data` ile yeniden üret). Her satır kendi step'i olarak doğrulanır.
 *     @Login → temiz, kimliksiz context.
 */
test.describe('Login (negative, Excel-driven)', () => {
  test(
    'rejects every invalid credential set',
    { tag: ['@Login', '@regression'] },
    async ({ loginPage, page }) => {
      // EN: Load scenarios from the workbook. / TR: Senaryoları çalışma kitabından yükle.
      const scenarios = await readRows(path.resolve('test-data/login-scenarios.xlsx'));
      expect(scenarios.length).toBeGreaterThan(0);

      // EN: One reported step per scenario row. / TR: Senaryo satırı başına bir raporlanan step.
      for (const scenario of scenarios) {
        await test.step(scenario.name, async () => {
          await loginPage.open();
          await loginPage.login(scenario.username, scenario.password);
          // EN: Expect the matching error and no navigation. / TR: Eşleşen hatayı ve yönlenmeme durumunu bekle.
          await loginPage.expectErrorMessage(scenario.expectedError);
          await expect(page).not.toHaveURL(/inventory\.html/);
        });
      }
    },
  );
});
