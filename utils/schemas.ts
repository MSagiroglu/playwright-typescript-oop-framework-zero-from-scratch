import { z } from 'zod';

/**
 * EN: Runtime response schemas (zod). Validating the *shape* of API responses catches
 *     contract drift that a plain status-code assertion would miss.
 * TR: Çalışma-anı yanıt şemaları (zod). API yanıtlarının *yapısını* doğrulamak, yalnız
 *     durum-kodu kontrolünün kaçıracağı sözleşme sapmalarını yakalar.
 */

// EN: A single post object. / TR: Tek bir gönderi nesnesi.
export const PostSchema = z.object({
  userId: z.number().int().positive(),
  id: z.number().int().positive(),
  title: z.string().min(1),
  body: z.string().min(1),
});

// EN: An array of posts. / TR: Gönderi dizisi.
export const PostArraySchema = z.array(PostSchema);

// EN: TS type inferred from the schema. / TR: Şemadan türetilen TS tipi.
export type Post = z.infer<typeof PostSchema>;
