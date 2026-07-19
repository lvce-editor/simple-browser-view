import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  ...config.recommendedVirtualDom,
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
  {
    files: [
      'packages/simple-browser-view/src/parts/ElectronWebContentsView/ElectronWebContentsView.ts',
      'packages/simple-browser-view/src/parts/WebContentsId/WebContentsId.ts',
    ],
    rules: {
      'virtual-dom/prefer-state-destructuring': 'off',
    },
  },
  {
    files: ['packages/simple-browser-view/test/**/*.ts'],
    rules: {
      'virtual-dom/no-inline-event-handlers': 'off',
      'virtual-dom/prefer-constants': 'off',
      'virtual-dom/prefer-merge-class-names': 'off',
      'virtual-dom/prefer-state-destructuring': 'off',
    },
  },
]
