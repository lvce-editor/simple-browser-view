import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  {
    ignores: ['packages/e2e/.test-with-playwright/**', 'packages/e2e/playwright.config.ts'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      'unicorn/prefer-single-call': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@cspell/spellchecker': 'off',
      'sonarjs/no-floating-point-equality': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'jest/no-restricted-jest-methods': 'off',
    },
  },
  {
    files: ['packages/e2e/electron/**/*.ts'],
    rules: {
      'e2e/no-imports': 'off',
    },
  },
]
