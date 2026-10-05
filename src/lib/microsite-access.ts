import { isUserAdmin, isUserOperator } from "./admin";

export function isGlobalDashboardViewer(email?: string | null): boolean {
    if (!email) {
        return false;
    }
    const normalizedEmail = email.trim().toLowerCase();

    const rawEnv =
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL ||
        process.env.GLOBAL_MICROSITE_VIEWER_EMAIL;

    if (!rawEnv) {
        return false;
    }

    const viewerEmails = rawEnv
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    return viewerEmails.includes(normalizedEmail);
}

export function isGlobalMicrositeViewer(email?: string | null, dbRole?: string | null): boolean {
    if (isUserAdmin(email, dbRole)) {
        return true;
    }
    if (isUserOperator(email, dbRole)) {
        return true;
    }
    return isGlobalDashboardViewer(email);
}


