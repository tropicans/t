import { prisma } from "@/lib/prisma";

export const RESERVED_SLUGS = [
    "dashboard",
    "login",
    "invite",
    "api",
    "l",
    "_next",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "static",
    "images",
    "uploads",
];

export function cleanSlugOrAlias(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * Checks for collision between short link aliases, microsite slugs, and reserved system routes.
 * Throws a descriptive Error if collision is detected.
 */
export async function validateSlugCollision(
    value: string,
    currentId?: string,
    isMicrosite: boolean = false
): Promise<string> {
    const clean = cleanSlugOrAlias(value);

    if (!clean || clean.length < 2) {
        throw new Error("Slug/alias must be at least 2 characters.");
    }
    if (clean.length > 60) {
        throw new Error("Slug/alias must be under 60 characters.");
    }

    if (RESERVED_SLUGS.includes(clean)) {
        throw new Error(`"${clean}" is a reserved route.`);
    }

    // Check Short Links
    const existingShort = await prisma.shortLink.findUnique({
        where: { shortCode: clean },
    });

    if (existingShort) {
        if (isMicrosite || !currentId || existingShort.id !== currentId) {
            throw new Error("This alias/slug is already taken by a short link.");
        }
    }

    // Check Microsites
    const existingMicrosite = await prisma.microsite.findUnique({
        where: { slug: clean },
    });

    if (existingMicrosite) {
        if (!isMicrosite || !currentId || existingMicrosite.id !== currentId) {
            throw new Error("This alias/slug is already taken by a microsite.");
        }
    }

    return clean;
}

/**
 * Validates the destination URL and performs auto-correction.
 */
export function validateAndCorrectUrl(urlInput: string): string {
    let urlToParse = urlInput.trim();

    // Check if it already has a scheme
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(urlToParse);
    if (!hasProtocol) {
        // Attempt to auto-correct by prepending https:// if it has a valid host structure
        try {
            const tempUrl = new URL(`https://${urlToParse}`);
            const hostname = tempUrl.hostname;
            const hasDot = hostname.includes(".");
            const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

            if (hasDot || (isLocal && process.env.NODE_ENV === "development")) {
                urlToParse = `https://${urlToParse}`;
            }
        } catch {
            // Ignored, fallback to new URL(urlToParse) which will fail
        }
    }

    let parsed: URL;
    try {
        parsed = new URL(urlToParse);
    } catch {
        throw new Error("Invalid URL format.");
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Only http: and https: protocols are allowed.");
    }

    const hostname = parsed.hostname.toLowerCase();
    if (process.env.NODE_ENV !== "development") {
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]") {
            throw new Error("Localhost and loopback IPs are not allowed in production.");
        }
    }

    return urlToParse;
}
