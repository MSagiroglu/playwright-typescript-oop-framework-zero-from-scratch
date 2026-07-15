import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { STORAGE_STATE_FILE } from '../../utils/constants';
import { getUserForShard } from '../../utils/userIdentity';

/**
 * EN: Setup project: logs in through the real UI once, then persists the session so the whole
 *     suite reuses it via `storageState`. Runs before the browser projects (declared as a
 *     dependency in playwright.config.ts), so no test pays the login cost again. The account
 *     is resolved per shard, so each CI shard authenticates as its own pooled user.
 * TR: Setup projesi: gerçek arayüzden bir kez giriş yapar, sonra oturumu kaydeder ki tüm suite
 *     `storageState` ile tekrar kullansın. Tarayıcı projelerinden önce çalışır (config'te
 *     dependency olarak tanımlı), böylece hiçbir test tekrar login maliyeti ödemez. Hesap
 *     shard başına çözülür; her CI shard'ı kendi havuz kullanıcısıyla giriş yapar.
 */
setup('authenticate', async ({ page }) => {
  // EN: Make sure the .auth directory exists. / TR: .auth klasörünün var olduğundan emin ol.
  fs.mkdirSync(path.dirname(STORAGE_STATE_FILE), { recursive: true });

  // EN: Resolve this shard's account. / TR: Bu shard'ın hesabını çöz.
  const user = getUserForShard();
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  // EN: Perform the real login and confirm it worked. / TR: Gerçek girişi yap ve başarılı olduğunu doğrula.
  await loginPage.open();
  await loginPage.login(user.username, user.password);
  await inventoryPage.expectLoaded();

  // EN: Persist the authenticated session to disk. / TR: Kimliği doğrulanmış oturumu diske kaydet.
  await page.context().storageState({ path: STORAGE_STATE_FILE });
});
