export function parseUserAgent(ua: string | null) {
    if (!ua) {
        return { device: "Unknown", browser: "Unknown" };
    }

    const lower = ua.toLowerCase();

    // 1. Device Type detection
    let device = "Desktop";
    if (/mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile|webos/i.test(lower)) {
        device = "Mobile";
    }

    // 2. Browser detection
    let browser = "Other";
    if (lower.includes("firefox")) {
        browser = "Firefox";
    } else if (lower.includes("opr") || lower.includes("opera")) {
        browser = "Opera";
    } else if (lower.includes("edg")) {
        browser = "Edge";
    } else if (lower.includes("chrome") && !lower.includes("chromium")) {
        browser = "Chrome";
    } else if (lower.includes("safari") && !lower.includes("chrome")) {
        browser = "Safari";
    }

    return { device, browser };
}
