/* eslint-env node */
module.exports = {
   //    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
   rules: {
      "@typescript-eslint/consistent-type-imports": "error",
   },
   parser: "@typescript-eslint/parser",
   plugins: ["@typescript-eslint"],
   root: true,
};
