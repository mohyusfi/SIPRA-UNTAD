import js from '@eslint/js'
import tsPlugin from 'typescript-eslint'
import globals from 'globals'

export default tsPlugin.config(
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.output/**',
      '.vercel/**',
      'drizzle/**',
      'app/routeTree.gen.ts',
    ],
  },
)
