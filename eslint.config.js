import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  {
    // CLAUDE.md hard constraint 5 — features must be rebuilt by hand, never imported from.
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)(\.\.?/)*(src/)?reference(/|$)',
              message: 'features must not import from reference — rebuild it yourself',
            },
            {
              group: ['@/reference', '@/reference/**'],
              message: 'features must not import from reference — rebuild it yourself',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
  },
]);
