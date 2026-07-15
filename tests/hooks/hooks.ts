import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { ConfigReader } from '../../utils/configReader';
import { STORAGE_STATE_FILE } from '../../utils/constants';
import { Logger } from '../../utils/logger';

/**
 * EN: Central fixture layer — the single import surface for every spec
 *     (`import { test, expect } from '../hooks/hooks'`). It (1) handles the session by tag,
 *     (2) injects ready-to-use Page Objects, and (3) provides an API request context.
 * TR: Merkezi fixture katmanı — her spec'in tek import yüzeyi
 *     (`import { test, expect } from '../hooks/hooks'`). (1) Oturumu tag'e göre yönetir,
 *     (2) kullanıma hazır Page Object'leri enjekte eder, (3) API request context sağlar.
 */

// EN: The custom fixtures this suite exposes. / TR: Bu suite'in sunduğu özel fixture'lar.
interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  apiRequest: APIRequestContext;
}

export const test = base.extend<Fixtures>({
  // EN: Tag rule → @Login gets a clean context; everything else reuses the authed session.
  // TR: Tag kuralı → @Login temiz bir context alır; diğer her şey oturumu yeniden kullanır.
  page: async ({ browser }, use, testInfo) => {
    const isLoginFlow = testInfo.tags.includes('@Login');
    // EN: Fresh context for login flows, stored session otherwise. / TR: Login akışlarında taze, aksi halde kayıtlı oturum.
    const context = await browser.newContext(
      isLoginFlow ? {} : { storageState: STORAGE_STATE_FILE },
    );
    const page: Page = await context.newPage();
    await use(page);
    // EN: Always tidy up the context. / TR: Context'i her zaman temizle.
    await context.close();
  },

  // EN: One ready Page Object per page — specs never call `new`. / TR: Sayfa başına hazır bir Page Object — spec'ler `new` çağırmaz.
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // EN: Pre-configured API context (base URL + JSON headers). / TR: Önceden yapılandırılmış API context (base URL + JSON header).
  apiRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: ConfigReader.getInstance().apiBaseUrl,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    await use(context);
    // EN: Release the request context. / TR: Request context'i serbest bırak.
    await context.dispose();
  },
});

// EN: Log the start of every test with the browser (project) name. / TR: Her testin başlangıcını tarayıcı (proje) adıyla logla.
test.beforeEach(async ({}, testInfo) => {
  new Logger(testInfo.project.name).start(testInfo.title);
});

// EN: Log the outcome (pass/skip/fail) with duration once each test ends.
// TR: Her test bitince sonucu (geçti/atlandı/başarısız) süreyle birlikte logla.
test.afterEach(async ({}, testInfo) => {
  const log = new Logger(testInfo.project.name);
  const duration = `${testInfo.duration}ms`;
  if (testInfo.status === 'passed') {
    log.success(`${testInfo.title} (${duration})`);
  } else if (testInfo.status === 'skipped') {
    log.skip(testInfo.title);
  } else {
    log.error(`${testInfo.title} — ${testInfo.status} (${duration})`);
  }
});

// EN: Re-export expect so specs import both from one place. / TR: expect'i yeniden dışa aktar; spec'ler ikisini tek yerden alsın.
export { expect };
