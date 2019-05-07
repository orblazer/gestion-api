module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  plugins: ['@typescript-eslint', 'standard'],
  rules: {
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false
      }
    ],

    // Enforce import order
    'import/order': 'error',

    // Imports should come first
    'import/first': 'error',

    // Other import rules
    'import/no-mutable-exports': 'error',

    // Allow unresolved imports
    'import/no-unresolved': 'off',

    // Allow paren-less arrow functions only when there's no braces
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],

    // Allow async-await
    'generator-star-spacing': 'off',

    // Allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': [
      process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      { allow: ['warn', 'error'] }
    ],

    // Prefer const over let
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false
      }
    ],

    // No single if in an "else" block
    'no-lonely-if': 'error',

    // Force curly braces for control flow,
    // including if blocks with a single statement
    curly: ['error', 'all'],

    // No async function without await
    'require-await': 'error',

    // Force dot notation when possible
    'dot-notation': 'error',

    'no-var': 'error',

    // Force object shorthand where possible
    'object-shorthand': 'error',

    // No useless destructuring/importing/exporting renames
    'no-useless-rename': 'error'
  }
}
