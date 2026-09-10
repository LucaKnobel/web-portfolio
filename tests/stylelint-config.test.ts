import { resolve } from "node:path";
import stylelint from "stylelint";
import { describe, expect, it } from "vitest";

const lint = async (code: string, filename = "src/components/Probe.astro") => {
  const result = await stylelint.lint({
    code,
    codeFilename: resolve(filename),
    configFile: resolve("stylelint.config.mjs"),
  });
  return result.results.flatMap((file) => file.warnings.map((warning) => warning.rule));
};

describe("styling guardrails", () => {
  it("parses Astro styles without interpreting frontmatter as CSS", async () => {
    expect(await lint(`---
const label = "#fff";
---
<button>{label}</button>
<style>.control { color: var(--color-text); }</style>`)).toEqual([]);
  });

  it("rejects unsafe cascade and colour rules inside Astro styles", async () => {
    const rules = await lint(`<style>
#bad { color: #fff; outline: none !important; }
[data-theme="dark"] .control { background: rgb(0 0 0); }
.one { .two { .three { .four { color: var(--color-text); } } } }
</style>`);
    expect(rules).toEqual(expect.arrayContaining([
      "selector-max-id",
      "color-no-hex",
      "property-disallowed-list",
      "declaration-no-important",
      "selector-disallowed-list",
      "function-disallowed-list",
      "max-nesting-depth",
    ]));
  });

  it("allows colour definitions only in the token file", async () => {
    const css = ":root { --color-bg: light-dark(#fff, #000); }";
    expect(await lint(css, "src/styles/tokens.css")).toEqual([]);
    expect(await lint(css, "src/styles/prose.css")).toContain("color-no-hex");
  });

  it("does not exempt all base styles from the important restriction", async () => {
    expect(await lint("a { outline: 2px solid currentColor !important; }", "src/styles/base.css"))
      .toContain("declaration-no-important");
  });
});
