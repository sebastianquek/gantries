/**
 * Followed these guides:
 * - https://typescript-eslint.io/docs/linting/
 * - https://typescript-eslint.io/docs/linting/type-linting
 */

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "react-app",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier", // https://prettier.io/docs/en/install.html#eslint-and-other-linters
  ],
  rules: {
    // Disabled to allow expect.any() to work
    "@typescript-eslint/no-unsafe-assignment": "off",
    // Let TypeScript handle unused variables
    "@typescript-eslint/no-unused-vars": "off",
    // Force the use of import type if import is only used for type purposes
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    // Ensure imports are ordered to keep things tidy
    "import/order": [
      "error",
      {
        groups: ["type", "builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
        },
      },
    ],
    // Standardise the use of named exports regardless if number of exports is 1
    "import/prefer-default-export": "off",
    // Ensure absolute imports make use of exported features only
    "no-restricted-imports": ["error", { patterns: ["features/*/*"] }],
    // Let TypeScript handle unused variables
    "no-unused-vars": "off",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
  overrides: [
    {
      // Ensure only non-e2e tests rely on jest rules
      files: ["**/__tests__/*.test.ts"],
      extends: [
        "react-app/jest"
      ]
    }
  ]
};
