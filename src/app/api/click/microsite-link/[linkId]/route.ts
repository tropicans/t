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

    // Track click (fire & forget)
    try {
        const headersList = await headers();
        await prisma.micrositeClick.create({
            data: {
                micrositeId: link.micrositeId,
                linkId: link.id,
                userAgent: headersList.get("user-agent") || "unknown",
                country: headersList.get("x-vercel-ip-country") || "unknown",
            },
        });
    } catch { }

    return NextResponse.redirect(link.url);
}
