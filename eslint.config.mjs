// EN: Flat ESLint config (ESLint 9). Kept lean and CI-friendly.
// TR: Düz ESLint yapılandırması (ESLint 9). Yalın ve CI-dostu tutuldu.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // EN: Never lint build/report output. / TR: Build/rapor çıktısını asla lint'leme.
    ignores: ['node_modules', 'dist', 'playwright-report', 'test-results', '.auth', 'downloads'],
  },
  // EN: Recommended JS + TypeScript rule sets. / TR: Önerilen JS + TypeScript kural setleri.
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // EN: Allow intentionally-unused args prefixed with "_". / TR: "_" ile başlayan bilerek-kullanılmayan argümanlara izin ver.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // EN: Playwright hooks require an empty `{}` fixture pattern (e.g. beforeEach({}, info)).
      // TR: Playwright hook'ları boş `{}` fixture desenini zorunlu kılar (ör. beforeEach({}, info)).
      'no-empty-pattern': 'off',
    },
  },
);
