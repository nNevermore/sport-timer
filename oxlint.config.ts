import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core],
  ignorePatterns: core.ignorePatterns,
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "func-style": "off",
    "no-negated-condition": "off",
    "no-nested-ternary": "off",
    "typescript/no-explicit-any": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/require-post-message-target-origin": "off",
    "no-plusplus": "off",
    "no-inline-comments": "off",
    "sort-keys": "off",
    "require-await": "off",
    complexity: "off",
    "unicorn/no-lonely-if": "off",
  },
});
