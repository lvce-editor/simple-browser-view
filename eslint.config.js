import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  {
    files: ['**/*.ts'],
    rules: {
      'unicorn/prefer-single-call': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
]
