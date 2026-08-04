export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    const { linkId } = await params;

    const link = await prisma.micrositeLink.findUnique({
        where: { id: linkId },
        include: { microsite: true },
    });

    if (!link) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!link.microsite || !link.microsite.isPublished) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!link.isActive) {
        return NextResponse.redirect(new URL("/" + link.microsite.slug, req.url));
    }

    // Track click (fire & forget in background)
    try {
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "unknown";
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] || 
                   headersList.get("x-real-ip") || 
                   "";
        
        const cfCountry = headersList.get("cf-ipcountry");
        const vercelCountry = headersList.get("x-vercel-ip-country");
        const cfViewerCountry = headersList.get("cloudfront-viewer-country");

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
                data: {
                    micrositeId: link.micrositeId,
                    linkId: link.id,
                    userAgent,
                    country,
                },
            });
        }).catch(err => {
            console.error("Background microsite click track failed:", err);
        });
    } catch (error) {
        console.error("Failed to track microsite click", error);
    }

    return NextResponse.redirect(link.url);
}
