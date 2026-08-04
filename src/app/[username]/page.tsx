export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { PasswordForm } from "@/components/short-link/password-form";
import { trackShortLinkClick } from "@/app/actions/short-link-redirect";
import type { Metadata } from "next";
import { MicrositePageClient } from "@/components/microsite-page-client";
import { getPublishedMicrosite } from "@/lib/public-microsite";

interface Props {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ error?: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://t.ppkasn.id";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username: slug } = await params;

    // Check if it's a microsite (skip short links for OG)
    const microsite = await prisma.microsite.findFirst({
        where: { slug, isPublished: true },
        select: { title: true, description: true, coverImage: true, avatarImage: true },
    });

    if (!microsite) {
        return { title: "Taut" };
    }

    const title = microsite.title;
    const description = microsite.description || `Kunjungi halaman ${microsite.title} di Taut`;
    const ogImage = microsite.coverImage || microsite.avatarImage || null;
    const pageUrl = `${APP_URL}/${slug}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: "Taut",
            type: "website",
            ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
        },
        twitter: {
            card: ogImage ? "summary_large_image" : "summary",
            title,
            description,
            ...(ogImage ? { images: [ogImage] } : {}),
        },
    };
}

export default async function SlugPage({ params, searchParams }: Props) {
    const { username: slug } = await params;
    const { error } = await searchParams;

    // ── 1. Short Link (highest priority) ────────────────────────────────────────
    const shortLink = await prisma.shortLink.findUnique({
        where: { shortCode: slug },
    });

    if (shortLink) {
        // Check expiration
        if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
                        <p className="text-zinc-400">This shortened link is no longer active.</p>
                    </div>
                </div>
            );
        }

        // Password protected
        if (shortLink.password) {
            return <PasswordForm shortCode={slug} error={error} />;
        }

        // Track & redirect
        await trackShortLinkClick(shortLink);
        redirect(shortLink.originalUrl);
    }

    // ── 2. Microsite ─────────────────────────────────────────────────────────────
    const microsite = await getPublishedMicrosite(slug);

    if (microsite) {
        // Track the initial page view only; client-side polling updates content separately.
        const h = await headers();
        const userAgent = h.get("user-agent") || "unknown";
        const ip = h.get("x-forwarded-for")?.split(",")[0] || 
                   h.get("x-real-ip") || 
                   "";
        
        const cfCountry = h.get("cf-ipcountry");
        const vercelCountry = h.get("x-vercel-ip-country");
        const cfViewerCountry = h.get("cloudfront-viewer-country");

        Promise.resolve().then(async () => {
            let country = cfCountry || vercelCountry || cfViewerCountry || "unknown";

            if (country === "unknown" && ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
                try {
                    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
                        signal: AbortSignal.timeout(2000),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.countryCode) {
                            country = data.countryCode;
                        }
                    }
                } catch {}
            }

            await prisma.micrositeClick.create({
                data: { micrositeId: microsite.id, userAgent, country },
            });
        }).catch(() => { });

        return (
            <MicrositePageClient
                initialMicrosite={microsite}
                pageUrl={`${process.env.NEXT_PUBLIC_APP_URL || "https://t.ppkasn.id"}/${microsite.slug}`}
            />
        );
    }

    // ── 3. Not found ─────────────────────────────────────────────────────────────
    notFound();
}


