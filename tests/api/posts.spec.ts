import { test, expect } from '../hooks/hooks';
import { API_ROUTES } from '../../utils/constants';
import { PostArraySchema, PostSchema } from '../../utils/schemas';
import { generatePost } from '../../utils/data-generator';

/**
 * EN: REST API tests against jsonplaceholder — status codes + schema-validated bodies.
 * TR: jsonplaceholder'a karşı REST API testleri — durum kodları + şema-doğrulamalı gövdeler.
 */
test.describe('Posts API', () => {
  test(
    'GET /posts returns 200 and a valid collection',
    { tag: ['@smoke'] },
    async ({ apiRequest }) => {
      const response = await apiRequest.get(API_ROUTES.posts);
      expect(response.status()).toBe(200);

      // EN: Schema validation throws on any contract drift. / TR: Şema doğrulaması, herhangi bir sözleşme sapmasında hata fırlatır.
      const posts = PostArraySchema.parse(await response.json());
      expect(posts.length).toBeGreaterThan(0);
    },
  );

  test(
    'POST /posts creates a resource and echoes the payload',
    { tag: ['@regression'] },
    async ({ apiRequest }) => {
      // EN: Random payload; the API echoes it back with an id. / TR: Rastgele yük; API bunu id ile geri döner.
      const newPost = generatePost();

      const response = await apiRequest.post(API_ROUTES.posts, { data: newPost });
      expect(response.status()).toBe(201);

      const created = PostSchema.parse(await response.json());
      expect(created).toMatchObject(newPost);
    },
  );

  test('GET a non-existent post returns 404', { tag: ['@regression'] }, async ({ apiRequest }) => {
    // EN: Unknown id → not found. / TR: Bilinmeyen id → bulunamadı.
    const response = await apiRequest.get(API_ROUTES.post(999999));
    expect(response.status()).toBe(404);
  });
});
