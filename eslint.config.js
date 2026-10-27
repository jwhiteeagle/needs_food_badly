import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
// tsc uses TS7; ESLint imports the TS6 API through the intentional package alias.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", ".vscode/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, Bun: "readonly" },
    },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
);
