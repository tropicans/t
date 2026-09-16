import { prisma } from "@/lib/prisma";

/**
 * Admin authorization utility.
 * Admins are defined either in ALLOWED_EMAILS (superadmin allowlist)
 * or via database role ADMIN.
 */
export function isUserAdmin(email?: string | null, dbRole?: string | null): boolean {
    if (dbRole === "ADMIN") return true;
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

    return false;
}

/**
 * Operator authorization utility.
 * Operators have global read-only visibility (GLOBAL_DASHBOARD_VIEWER_EMAIL or dbRole OPERATOR).
 */
export function isUserOperator(email?: string | null, dbRole?: string | null): boolean {
    if (isUserAdmin(email, dbRole)) return false;
    if (dbRole === "OPERATOR") return true;
    if (!email) return false;

    const normalizedEmail = email.trim().toLowerCase();
    const rawViewerEnv =
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL ||
        process.env.GLOBAL_MICROSITE_VIEWER_EMAIL;
    if (rawViewerEnv) {
        const viewerEmails = rawViewerEnv
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
        if (viewerEmails.includes(normalizedEmail)) {
            return true;
        }
    }

    return false;
}

/**
 * Resolves effective UserRole for a user given their email and DB role.
 */
export function resolveUserRole(email?: string | null, dbRole?: string | null): "ADMIN" | "OPERATOR" | "MEMBER" {
    if (isUserAdmin(email, dbRole)) return "ADMIN";
    if (isUserOperator(email, dbRole)) return "OPERATOR";
    return (dbRole as "MEMBER") || "MEMBER";
}

export interface AdminUserItem {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: "ADMIN" | "OPERATOR" | "MEMBER";
    createdAt: Date;
    isAdmin: boolean;
    isOperator: boolean;
    invitationId: string | null;
    invitation: {
        id: string;
        token: string;
        invitedBy: {
            id: string;
            name: string | null;
            email: string | null;
        } | null;
    } | null;
    _count: {
        shortLinks: number;
        microsites: number;
    };
}

/**
 * Fetches all registered users for administrators, annotating with admin status and metadata.
 */
export async function getAllUsersForAdmin(): Promise<AdminUserItem[]> {
    const users = await prisma.user.findMany({
        include: {
            invitation: {
                select: {
                    id: true,
                    token: true,
                    invitedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    shortLinks: true,
                    microsites: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return users.map((user) => {
        const effectiveRole = resolveUserRole(user.email, user.role);
        return {
            ...user,
            role: effectiveRole,
            isAdmin: effectiveRole === "ADMIN",
            isOperator: effectiveRole === "OPERATOR",
        };
    });
}

