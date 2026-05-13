module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
  },
}
