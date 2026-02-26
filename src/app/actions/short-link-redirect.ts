"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { type ShortLink } from "@prisma/client";

export async function trackShortLinkClick(link: ShortLink) {
    try {
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "unknown";
        const country = headersList.get("x-vercel-ip-country") || "unknown";

        await prisma.shortLinkClick.create({
            data: {
                shortLinkId: link.id,
                userAgent,
                country,
            },
        });
    } catch (error) {
        console.error("Failed to track short link click", error);
    }
}

export async function verifyPasswordAndRedirect(shortCode: string, formData: FormData) {
    const password = formData.get("password") as string;

    if (!password) {
        redirect(`/${shortCode}?error=Password is required`);
    }

    const link = await prisma.shortLink.findUnique({ where: { shortCode } });

    if (!link || !link.password) {
        redirect(`/${shortCode}?error=Invalid link`);
    }

    const isMatch = await bcrypt.compare(password, link.password);

    if (!isMatch) {
        redirect(`/${shortCode}?error=Incorrect password`);
    }

    await trackShortLinkClick(link);
    redirect(link.originalUrl);
}
