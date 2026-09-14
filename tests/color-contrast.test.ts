import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const tokens = new Map(
  [...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [match[1]!, match[2]!.trim()]),
);

type Theme = "light" | "dark";

function color(token: string, theme: Theme): string {
  const value = tokens.get(token);
  if (!value) throw new Error(`Missing color token: ${token}`);
  const pair = /^light-dark\((.*),\s*(.*)\)$/.exec(value);
  const selected = pair ? pair[theme === "light" ? 1 : 2]!.trim() : value;
  const reference = /^var\((--[\w-]+)\)$/.exec(selected);
  if (reference) return color(reference[1]!, theme);
  if (!/^#[\da-f]{6}$/i.test(selected)) throw new Error(`Unsupported color: ${selected}`);
  return selected;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

function contrast(foreground: string, background: string, theme: Theme): number {
  const values = [luminance(color(foreground, theme)), luminance(color(background, theme))];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

describe.each<Theme>(["light", "dark"])("text contrast in %s theme", (theme) => {
  it.each([
    "--syntax-accent", "--syntax-comment", "--syntax-code",
    "--syntax-number", "--syntax-string", "--color-text", "--color-link",
  ])("keeps %s readable on code backgrounds", (foreground) => {
    for (const background of ["--color-surface-1", "--color-surface-2"]) {
      expect(contrast(foreground, background, theme)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(["--color-primary", "--color-primary-hover", "--color-primary-active"])(
    "keeps primary button text readable on %s",
    (background) => {
      expect(contrast("--color-on-primary", background, theme)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
