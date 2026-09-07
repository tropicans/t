import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandLogo } from "./brand-logo";

describe("BrandLogo Component", () => {
    it("renders full variant with mark and wordmark by default", () => {
        const html = renderToStaticMarkup(<BrandLogo />);
        expect(html).toContain("Taut");
        expect(html).toContain("<svg");
        expect(html).toContain("rect");
    });

    it("renders mark-only variant without wordmark text", () => {
        const html = renderToStaticMarkup(<BrandLogo variant="mark" />);
        expect(html).toContain("<svg");
        expect(html).not.toContain(">Taut");
    });

    it("renders wordmark-only variant without svg mark", () => {
        const html = renderToStaticMarkup(<BrandLogo variant="wordmark" />);
        expect(html).toContain("Taut");
        expect(html).not.toContain("<svg");
    });

    it("supports bare stroke mode when withBackground is false", () => {
        const html = renderToStaticMarkup(<BrandLogo withBackground={false} />);
        expect(html).toContain("currentColor");
        expect(html).not.toContain("<linearGradient");
    });

    it("accepts custom className and size variations", () => {
        const html = renderToStaticMarkup(<BrandLogo size="lg" className="custom-logo-class" />);
        expect(html).toContain("custom-logo-class");
        expect(html).toContain('width="40"');
        expect(html).toContain('height="40"');
    });
});
