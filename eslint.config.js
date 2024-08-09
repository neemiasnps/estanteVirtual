/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    // Adicione outras extensões que você usa
  ],
  rules: {
    // Suas regras personalizadas aqui
    'no-unused-vars': 'warn',
    'no-unused-expressions': 'warn',
  },
};
