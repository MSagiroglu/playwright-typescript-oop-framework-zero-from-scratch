import { test, expect } from '../hooks/hooks';
import fs from 'node:fs';
import path from 'node:path';
import { API_ROUTES, DOWNLOAD_DIR } from '../../utils/constants';
import { PostArraySchema } from '../../utils/schemas';

/**
 * EN: Download → verify → delete. Demonstrates the download-artifact lifecycle used by real
 *     suites (e.g. downloading a report, checking it, then cleaning up so the repo stays clean).
 * TR: İndir → doğrula → sil. Gerçek suite'lerdeki indirme-dosyası yaşam döngüsünü gösterir
 *     (ör. bir raporu indir, kontrol et, sonra temizle ki repo kirlenmesin).
 */
test.describe('Artifact download', () => {
  test(
    'downloads a payload, verifies it, then deletes the file',
    { tag: ['@regression'] },
    async ({ apiRequest }) => {
      // EN: Ensure the downloads folder exists. / TR: downloads klasörünün var olduğundan emin ol.
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
      // EN: Unique name per process avoids clashes across parallel workers.
      // TR: Süreç başına benzersiz ad, paralel worker'lar arası çakışmayı önler.
      const filePath = path.join(DOWNLOAD_DIR, `posts-${process.pid}.json`);

      await test.step('download the payload to the downloads folder', async () => {
        // EN: Fetch the data and write it to disk (the "download"). / TR: Veriyi çek ve diske yaz (indirme).
        const response = await apiRequest.get(API_ROUTES.posts);
        expect(response.status()).toBe(200);
        fs.writeFileSync(filePath, await response.text());
      });

      await test.step('verify the downloaded file', async () => {
        // EN: File must exist and hold a schema-valid, non-empty collection.
        // TR: Dosya var olmalı ve şemaya uygun, boş olmayan bir koleksiyon içermeli.
        expect(fs.existsSync(filePath)).toBe(true);
        const parsed = PostArraySchema.parse(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
        expect(parsed.length).toBeGreaterThan(0);
      });

      await test.step('delete the file after verification', async () => {
        // EN: Clean up so downloaded artifacts never linger. / TR: İndirilen dosya kalmasın diye temizle.
        fs.rmSync(filePath);
        expect(fs.existsSync(filePath)).toBe(false);
      });
    },
  );
});
