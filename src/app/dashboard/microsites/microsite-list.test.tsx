import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MicrositeList, type MicrositeItem } from "./microsite-list";

const mockMicrosites: MicrositeItem[] = [
    {
        id: "ms-1",
        title: "Campaign Keren",
        slug: "campaign-keren",
        theme: "default",
        isPublished: true,
        userId: "user-1",
        createdAt: new Date(),
        _count: { links: 5, clicks: 120 },
        user: { name: "Budi", email: "budi@example.com" },
    },
    {
        id: "ms-2",
        title: "Event Tahunan",
        slug: "event-2026",
        theme: "ocean",
        isPublished: false,
        userId: "user-1",
        createdAt: new Date(),
        _count: { links: 2, clicks: 10 },
        user: { name: "Budi", email: "budi@example.com" },
    },
    {
        id: "ms-3",
        title: "Katalog Produk",
        slug: "katalog",
        theme: "sunset",
        isPublished: true,
        userId: "user-2",
        createdAt: new Date(),
        _count: { links: 15, clicks: 450 },
        user: { name: "Siti", email: "siti@example.com" },
    },
];

describe("MicrositeList Component", () => {
    it("renders empty state when there are no microsites", () => {
        const html = renderToStaticMarkup(
            <MicrositeList
                initialMicrosites={[]}
                viewerUserId="user-1"
                canViewAllMicrosites={false}
            />
        );

        expect(html).toContain("Belum ada microsite");
        expect(html).toContain("Buat Microsite");
    });

    it("renders search input, filter pills, and microsite cards", () => {
        const html = renderToStaticMarkup(
            <MicrositeList
                initialMicrosites={mockMicrosites}
                viewerUserId="user-1"
                canViewAllMicrosites={false}
            />
        );

        // Search input & filter buttons
        expect(html).toContain('placeholder="Cari judul, slug, atau nama..."');
        expect(html).toContain("Semua (3)");
        expect(html).toContain("Publik (2)");
        expect(html).toContain("Draft (1)");

        // Items rendered
        expect(html).toContain("Campaign Keren");
        expect(html).toContain("/campaign-keren");
        expect(html).toContain("Event Tahunan");
        expect(html).toContain("/event-2026");
    });

    it("displays owner name when canViewAllMicrosites is true for other users' microsites", () => {
        const html = renderToStaticMarkup(
            <MicrositeList
                initialMicrosites={mockMicrosites}
                viewerUserId="user-1"
                canViewAllMicrosites={true}
            />
        );

        // ms-3 is owned by Siti (user-2)
        expect(html).toContain("Owner: Siti");
    });

    it("shows pagination controls when items exceed pageSize", () => {
        const html = renderToStaticMarkup(
            <MicrositeList
                initialMicrosites={mockMicrosites}
                viewerUserId="user-1"
                canViewAllMicrosites={false}
                pageSize={2}
            />
        );

        expect(html).toContain("Halaman 1 dari 2");
        expect(html).toContain("Sebelumnya");
        expect(html).toContain("Berikutnya");
        expect(html).toContain("Campaign Keren");
        expect(html).toContain("Event Tahunan");
    });
});
