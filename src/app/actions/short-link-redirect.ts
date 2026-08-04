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

            await prisma.shortLinkClick.create({
                data: {
                    shortLinkId: link.id,
                    userAgent,
                    country,
                },
            });
        }).catch(err => {
            console.error("Background short link track failed:", err);
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

    if (link.expiresAt && link.expiresAt < new Date()) {
        redirect(`/${shortCode}`);
    }

    const isMatch = await bcrypt.compare(password, link.password);

    if (!isMatch) {
        redirect(`/${shortCode}?error=Incorrect password`);
    }

    await trackShortLinkClick(link);
    redirect(link.originalUrl);
}
