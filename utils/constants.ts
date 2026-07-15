/**
 * EN: Shared constants — one place for every fixed value, so there are no magic
 *     strings/numbers scattered across the suite.
 * TR: Ortak sabitler — tüm değişmez değerler tek yerde; böylece kod içine dağılmış
 *     "sihirli" string/sayı olmaz.
 *
 * EN: The saucedemo.com credentials below are the site's own publicly documented demo
 *     accounts (shown on its login page) — not secrets.
 * TR: Aşağıdaki saucedemo.com bilgileri sitenin kendi login sayfasında açıkça yayınlanan
 *     genel demo hesaplarıdır — gizli bilgi değildir.
 */

// EN: Directory holding the authenticated session file. / TR: Oturum dosyasının bulunduğu klasör.
export const STORAGE_STATE_DIR = '.auth';

// EN: Authenticated session persisted by auth.setup.ts and reused by the suite.
// TR: auth.setup.ts tarafından kaydedilen ve tüm suite'in tekrar kullandığı oturum dosyası.
export const STORAGE_STATE_FILE = '.auth/user.json';

// EN: Folder where tests save downloaded files before verifying and deleting them.
// TR: Testlerin indirdiği dosyaları doğrulayıp silmeden önce kaydettiği klasör.
export const DOWNLOAD_DIR = 'downloads';

// EN: Demo users. / TR: Demo kullanıcılar.
export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  invalid: { username: 'no_such_user', password: 'wrong_password' },
} as const;

// EN: Expected inline error messages on the login page. / TR: Login sayfasındaki beklenen hata mesajları.
export const LOGIN_ERRORS = {
  lockedOut: 'Sorry, this user has been locked out.',
  invalid: 'Username and password do not match any user in this service',
} as const;

// EN: Product sort dropdown option values. / TR: Ürün sıralama açılır menüsünün seçenek değerleri.
export const SORT_OPTIONS = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hihi',
} as const;

// EN: Product names used across UI tests. / TR: UI testlerinde kullanılan ürün adları.
export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltShirt: 'Sauce Labs Bolt T-Shirt',
} as const;

// EN: Endpoint paths for the public JSONPlaceholder API. / TR: Public JSONPlaceholder API uç yolları.
export const API_ROUTES = {
  posts: '/posts',
  post: (id: number): string => `/posts/${id}`,
} as const;
