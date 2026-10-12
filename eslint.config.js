import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "build"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // The fleet kit (src/components/FleetMenu.tsx) is copied byte-identical
    // from the Next apps, where it carries an `@next/next/no-img-element`
    // disable comment. ESLint errors on a disable comment for a rule it has
    // never heard of, and the kit can't be edited per app, so this registers a
    // no-op rule under that name for the kit file alone (and, the rule being a
    // no-op, stops the comment reading as unused).
    files: ["src/components/FleetMenu.tsx"],
    linterOptions: { reportUnusedDisableDirectives: "off" },
    plugins: {
      "@next/next": { rules: { "no-img-element": { create: () => ({}) } } },
    },
  },
);
