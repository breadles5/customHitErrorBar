import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ["node_modules/", "dist/", "js/socket.js"],
  },
  // Main configuration
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": ["warn"],
      eqeqeq: ["error", "always"],
      "no-console": "off",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
  // Include the recommended rules from @eslint/js
  pluginJs.configs.recommended,
];
