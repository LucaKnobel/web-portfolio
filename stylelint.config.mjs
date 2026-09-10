export default {
  extends: ["stylelint-config-recommended"],
  reportNeedlessDisables: true,
  rules: {
    "max-nesting-depth": 2,
    "selector-max-specificity": "0,3,0",
    "selector-max-id": 0,
    "declaration-no-important": true,
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color", "light-dark"],
    "property-disallowed-list": ["/^outline(?:-|$)/"],
    "selector-disallowed-list": ["/\\[data-theme(?:[\\s=~|^$*\\]])/"],
    "declaration-property-value-disallowed-list": {
      "/.*/": ["/var\\(--(?:neutral|primary|error|info|success|warning)-\\d/"],
    },
  },
  overrides: [
    { files: ["**/*.astro"], customSyntax: "postcss-html" },
    {
      files: ["src/styles/tokens.css"],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "function-disallowed-list": null,
        "selector-disallowed-list": null,
        "declaration-property-value-disallowed-list": null,
      },
    },
    {
      files: ["src/styles/base.css"],
      rules: { "property-disallowed-list": null },
    },
  ],
};
