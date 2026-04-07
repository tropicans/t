export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPublishedMicrosite } from "@/lib/public-microsite";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const microsite = await getPublishedMicrosite(slug);

    if (!microsite) {
        return NextResponse.json(
            { error: "Not found" },
            {
                status: 404,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }

    return NextResponse.json(microsite, {
        headers: { "Cache-Control": "no-store" },
    });
}
