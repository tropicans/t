export function isGlobalDashboardViewer(email?: string | null): boolean {
    const configuredEmail =
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL?.trim().toLowerCase()
        || process.env.GLOBAL_MICROSITE_VIEWER_EMAIL?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!configuredEmail || !normalizedEmail) {
        return false;
    }

    return configuredEmail === normalizedEmail;
}

export const isGlobalMicrositeViewer = isGlobalDashboardViewer;
