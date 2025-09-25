module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  env: { browser: true, es2022: true, node: true },
  settings: {},
  rules: {
    'complexity': ['error', 10],
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};
