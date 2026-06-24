module.exports = {
  extends: [
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:node/recommended"
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-var-requires": "off",
    "no-unused-expressions": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-missing-import": ["error", {
      "tryExtensions": [".js", ".ts"]
    }],
    "valid-jsdoc": ["warn", { "requireReturnType": false, "requireParamType": false }]
  }
}
