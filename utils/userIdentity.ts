/**
 * EN: Per-shard user identity — the single source of truth for "which account this run uses".
 *     A single account can hit server-side session locks or rate limits when many shards use
 *     it at once, so each shard is handed its own account from a pool.
 * TR: Shard başına kullanıcı kimliği — "bu koşu hangi hesabı kullanıyor" sorusunun TEK kaynağı.
 *     Tek bir hesap, birçok shard aynı anda kullanınca sunucu tarafında oturum kilidi/limit
 *     sorunları yaşatabilir; bu yüzden her shard havuzdan kendi hesabını alır.
 *
 * EN: Resolution order: 1) PW_USER override, 2) SHARD_INDEX round-robin, 3) default standard user.
 * TR: Çözüm sırası: 1) PW_USER override, 2) SHARD_INDEX round-robin, 3) varsayılan standart kullanıcı.
 */

// EN: A username/password pair. / TR: Kullanıcı adı/şifre çifti.
export interface UserCredentials {
  readonly username: string;
  readonly password: string;
}

// EN: Public demo password shared by all saucedemo users. / TR: Tüm saucedemo kullanıcılarının ortak public şifresi.
const PASSWORD = 'secret_sauce';

// EN: Accounts that complete every functional flow (login → checkout).
// TR: Tüm fonksiyonel akışı tamamlayan hesaplar (login → ödeme).
export const USER_POOL: readonly UserCredentials[] = [
  { username: 'standard_user', password: PASSWORD },
  { username: 'performance_glitch_user', password: PASSWORD },
];

// EN: Resolve the account for the current run/shard. / TR: Mevcut koşu/shard için hesabı çöz.
export function getUserForShard(): UserCredentials {
  // EN: 1) Explicit override wins (CI sets this per shard). / TR: 1) Açık override kazanır (CI shard başına set eder).
  const explicit = process.env.PW_USER;
  if (explicit) {
    return { username: explicit, password: process.env.PW_PASSWORD ?? PASSWORD };
  }

  // EN: 2) Otherwise pick from the pool by shard number. / TR: 2) Aksi halde shard numarasına göre havuzdan seç.
  const shardIndex = Number(process.env.SHARD_INDEX ?? '1');
  const poolIndex = (Math.max(1, shardIndex) - 1) % USER_POOL.length;
  return USER_POOL[poolIndex];
}
