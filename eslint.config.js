const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'logs/**'] },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }], // try/catch de localStorage
      'no-useless-assignment': 'warn',
    },
  },
  {
    // Backend (Node, CommonJS)
    files: ['*.js', 'ixcModules/**/*.js', 'tests/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    // Frontend (navegador): funções compartilhadas entre scripts via escopo global
    files: ['public/js/**/*.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
    rules: {
      'no-unused-vars': 'off', // funções são chamadas por onclick="..." nas views
      'no-undef': 'off', // funções vêm de outros <script> (escopo global)
    },
  },
];
