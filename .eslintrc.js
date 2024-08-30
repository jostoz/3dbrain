// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  plugins: ["react", "jsx-a11y"],
  extends: ["airbnb"],
  rules: {
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",

    "no-console": 0,
    "no-alert": 0,
    indent: "off",
    "max-len": ["error", 200],
    "react/jsx-filename-extension": 0,
    "import/prefer-default-export": 0,
    "react/no-unused-prop-types": 0,
    "react/require-default-props": 0,
    "react/prop-types": 0,
    "no-unused-vars": 0,
    "react/jsx-indent": 0,
    "react/forbid-prop-types": 0,
    "react/no-danger": 0,
    "react/no-danger-with-children": 0,
    "react/no-multi-comp": 0,
    "import/no-extraneous-dependencies": 0,
    "import/no-unresolved": 0,
    "import/extensions": 0,
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": ["warn", { aspects: ["invalidHref"] }],
    "jsx-a11y/img-has-alt": "off",
    "jsx-a11y/label-has-for": "off",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": [
      "error",
      { a: ["button"] },
    ],
    "trailing-comma": "off",
    "spaced-comment": "off",
    "no-mixed-operators": "off",
    "comma-dangle": "off",
    quotes: "off",
    "class-methods-use-this": "off",
    "function-paren-newline": "off",
    'linebreak-style': 'off', // This turns off the linebreak-style rule
  },
};
