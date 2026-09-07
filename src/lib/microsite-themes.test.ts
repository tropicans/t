import { describe, it, expect } from "vitest";
import {
  MICROSITE_THEMES,
  DEFAULT_MICROSITE_THEME_ID,
  isMicrositeThemeId,
  normalizeMicrositeTheme,
  getMicrositeTheme,
} from "./microsite-themes";

describe("microsite-themes registry", () => {
  it("should contain the 'claude' preset theme", () => {
    const claudeTheme = MICROSITE_THEMES.find((t) => t.id === "claude");
    expect(claudeTheme).toBeDefined();
    expect(claudeTheme?.label).toBe("Claude");
    expect(claudeTheme?.tagline).toContain("terracotta");
  });

  it("should correctly identify valid and invalid theme ids", () => {
    expect(isMicrositeThemeId("claude")).toBe(true);
    expect(isMicrositeThemeId("dark")).toBe(true);
    expect(isMicrositeThemeId("light")).toBe(true);
    expect(isMicrositeThemeId("invalid-theme-id")).toBe(false);
    expect(isMicrositeThemeId("")).toBe(false);
  });

  it("should normalize valid and invalid theme ids correctly", () => {
    expect(normalizeMicrositeTheme("claude")).toBe("claude");
    expect(normalizeMicrositeTheme("dark")).toBe("dark");
    expect(normalizeMicrositeTheme("unknown")).toBe(DEFAULT_MICROSITE_THEME_ID);
    expect(normalizeMicrositeTheme(null)).toBe(DEFAULT_MICROSITE_THEME_ID);
    expect(normalizeMicrositeTheme(undefined)).toBe(DEFAULT_MICROSITE_THEME_ID);
    expect(normalizeMicrositeTheme("")).toBe(DEFAULT_MICROSITE_THEME_ID);
  });

  it("should return the claude theme with expected Claude editorial design tokens", () => {
    const theme = getMicrositeTheme("claude");
    expect(theme.id).toBe("claude");
    expect(theme.label).toBe("Claude");

    // Preview specifications
    expect(theme.preview.dot).toContain("#cc785c");
    expect(theme.preview.bg).toContain("#faf9f5");

    // Public styles specifications
    expect(theme.public.page).toBe("bg-[#faf9f5]");
    expect(theme.public.title).toContain("font-serif");
    expect(theme.public.title).toContain("text-[#141413]");
    expect(theme.public.card).toContain("bg-[#efe9de]");
    expect(theme.public.card).toContain("border-[#e6dfd8]");
    expect(theme.public.icon).toContain("text-[#cc785c]");
    expect(theme.public.divider).toContain("bg-[#e6dfd8]");

    // Thumbnail specifications
    expect(theme.thumbnail.avatar).toContain("text-[#cc785c]");
    expect(theme.thumbnail.avatar).toContain("bg-[#efe9de]");
  });

  it("should fallback to default theme when getMicrositeTheme is called with invalid or null values", () => {
    const fallbackTheme = getMicrositeTheme("non-existent");
    expect(fallbackTheme.id).toBe(DEFAULT_MICROSITE_THEME_ID);

    const nullTheme = getMicrositeTheme(null);
    expect(nullTheme.id).toBe(DEFAULT_MICROSITE_THEME_ID);
  });

  it("should enforce complete contract for all registered themes in MICROSITE_THEMES", () => {
    for (const theme of MICROSITE_THEMES) {
      expect(theme.id).toBeTruthy();
      expect(theme.label).toBeTruthy();
      expect(theme.tagline).toBeTruthy();

      expect(theme.preview.bg).toBeTruthy();
      expect(theme.preview.dot).toBeTruthy();
      expect(theme.preview.card).toBeTruthy();

      expect(theme.public.page).toBeTruthy();
      expect(theme.public.hero).toBeTruthy();
      expect(theme.public.title).toBeTruthy();
      expect(theme.public.description).toBeTruthy();
      expect(theme.public.avatar).toBeTruthy();
      expect(theme.public.card).toBeTruthy();
      expect(theme.public.cardTitle).toBeTruthy();
      expect(theme.public.icon).toBeTruthy();
      expect(theme.public.empty).toBeTruthy();
      expect(theme.public.footer).toBeTruthy();
      expect(theme.public.footerBrand).toBeTruthy();
      expect(theme.public.divider).toBeTruthy();
      expect(theme.public.share).toBeTruthy();
      expect(theme.public.shareLabel).toBeTruthy();

      expect(theme.thumbnail.container).toBeTruthy();
      expect(theme.thumbnail.avatar).toBeTruthy();
    }
  });
});
