import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.vitepress/cache/**',
      '**/.turbo/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Nuxt pages can be single-word (index, login, etc.) and use compile-time macros
    // (definePageMeta, useHead) that are auto-imported — not real undefined globals.
    files: ['**/pages/**/*.vue', '**/layouts/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-undef': 'off',
    },
  },
  {
    // Package runtime components rely on Nuxt auto-imports (useNuxtApp, useCrud,
    // useSnackStore, etc.) that are not resolvable at lint time outside an app context.
    files: ['packages/@mapomodule/*/src/runtime/**/*.{vue,ts}'],
    rules: {
      'no-undef': 'off',
    },
  },
)
