import js from '@eslint/js';
import globals from 'globals';

export default [
  {languageOptions: {globals: globals.browser}},
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
];
