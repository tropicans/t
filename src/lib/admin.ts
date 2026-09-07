/**
 * Admin authorization utility.
 * Admins are defined either in ALLOWED_EMAILS (superadmin allowlist)
 * or GLOBAL_DASHBOARD_VIEWER_EMAIL / GLOBAL_MICROSITE_VIEWER_EMAIL.
 */
export function isUserAdmin(email?: string | null): boolean {
    if (!email) return false;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check ALLOWED_EMAILS (superadmin allowlist)
    const allowedEmailsStr = process.env.ALLOWED_EMAILS;
    if (allowedEmailsStr) {
        const allowedEmails = allowedEmailsStr
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
        if (allowedEmails.includes(normalizedEmail)) {
            return true;
        }
    }

    // 2. Check GLOBAL_DASHBOARD_VIEWER_EMAIL or GLOBAL_MICROSITE_VIEWER_EMAIL
    const viewerEmail =
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL?.trim().toLowerCase() ||
        process.env.GLOBAL_MICROSITE_VIEWER_EMAIL?.trim().toLowerCase();
    if (viewerEmail && viewerEmail === normalizedEmail) {
        return true;
    }

    return false;
}
