import { faker } from '@faker-js/faker';

/**
 * EN: Faker-based test-data generators. Generating data instead of hard-coding it keeps
 *     tests independent and proves each run works with arbitrary valid input.
 * TR: Faker tabanlı test-verisi üreticileri. Veriyi sabit yazmak yerine üretmek, testleri
 *     bağımsız tutar ve her koşunun rastgele geçerli girdiyle çalıştığını kanıtlar.
 */

// EN: Shipping details for the saucedemo checkout form. / TR: saucedemo ödeme formunun kargo bilgileri.
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

// EN: A `type` (not `interface`) so it satisfies Playwright's Record<string, unknown> body param.
// TR: `type` (interface değil); böylece Playwright'ın Record<string, unknown> gövde parametresine uyar.
export type NewPost = {
  title: string;
  body: string;
  userId: number;
};

// EN: Random but valid checkout details. / TR: Rastgele ama geçerli ödeme bilgileri.
export function generateCheckoutInfo(): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
  };
}

// EN: A random post payload for the API. / TR: API için rastgele bir gönderi yükü.
export function generatePost(): NewPost {
  return {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    userId: faker.number.int({ min: 1, max: 10 }),
  };
}
