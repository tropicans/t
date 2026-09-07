import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type InvitationValidationReason =
    | "NOT_FOUND"
    | "EXPIRED"
    | "EXHAUSTED"
    | "REVOKED"
    | "EMAIL_MISMATCH";

export interface InvitationValidationResult {
    valid: boolean;
    reason?: InvitationValidationReason;
    message?: string;
    invitation?: {
        id: string;
        token: string;
        email: string | null;
        invitedById: string;
        maxUses: number;
        usesCount: number;
        expiresAt: Date | null;
        status: string;
        invitedBy?: {
            id: string;
            name: string | null;
            image: string | null;
            email: string | null;
        };
    };
}

/**
 * Generates a URL-safe, high-entropy unique invitation token.
 */
export function generateInvitationToken(): string {
    // 24 characters provide > 140 bits of entropy, safe against brute force
    return nanoid(24);
}

/**
 * Validates whether an invitation is currently valid and claimable.
 * Pure logic function for both client/server validation and testability.
 */
export function validateInvitationStatus(
    invitation: {
        id: string;
        token: string;
        email: string | null;
        invitedById: string;
        maxUses: number;
        usesCount: number;
        expiresAt: Date | null;
        status: string;
        invitedBy?: {
            id: string;
            name: string | null;
            image: string | null;
            email: string | null;
        };
    } | null,
    targetEmail?: string | null
): InvitationValidationResult {
    if (!invitation) {
        return {
            valid: false,
            reason: "NOT_FOUND",
            message: "Undangan tidak ditemukan atau tautan tidak valid.",
        };
    }

    if (invitation.status === "REVOKED") {
        return {
            valid: false,
            reason: "REVOKED",
            message: "Tautan undangan ini telah dicabut oleh pemilik.",
        };
    }

    if (invitation.status === "EXPIRED") {
        return {
            valid: false,
            reason: "EXPIRED",
            message: "Tautan undangan ini telah kedaluwarsa.",
        };
    }

    // Check expiration timestamp
    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
        return {
            valid: false,
            reason: "EXPIRED",
            message: "Masa berlaku tautan undangan ini telah habis.",
        };
    }

    // Check usage limits
    if (invitation.usesCount >= invitation.maxUses || invitation.status === "ACCEPTED") {
        return {
            valid: false,
            reason: "EXHAUSTED",
            message: "Batas kuota pemakaian tautan undangan ini telah habis.",
        };
    }

    // Check target email match if restricted to specific email
    if (invitation.email && targetEmail) {
        if (invitation.email.trim().toLowerCase() !== targetEmail.trim().toLowerCase()) {
            return {
                valid: false,
                reason: "EMAIL_MISMATCH",
                message: `Tautan undangan ini khusus diperuntukkan bagi alamat email ${invitation.email}.`,
            };
        }
    }

    return {
        valid: true,
        invitation,
    };
}

/**
 * Creates a new invitation record in the database.
 */
export async function createInvitation(input: {
    invitedById: string;
    email?: string | null;
    maxUses?: number;
    expiresInDays?: number | null;
    expiresAt?: Date | null;
}) {
    const cleanedEmail = input.email ? input.email.trim().toLowerCase() : null;
    const maxUses = input.maxUses && input.maxUses > 0 ? input.maxUses : 1;

    let expiresAt = input.expiresAt || null;
    if (!expiresAt && input.expiresInDays && input.expiresInDays > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
    }

    const token = generateInvitationToken();

    return await prisma.invitation.create({
        data: {
            token,
            email: cleanedEmail,
            invitedById: input.invitedById,
            maxUses,
            usesCount: 0,
            expiresAt,
            status: "PENDING",
        },
        include: {
            invitedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

/**
 * Fetches an invitation by token with inviter information.
 */
export async function getInvitationByToken(token: string) {
    if (!token) return null;
    return await prisma.invitation.findUnique({
        where: { token },
        include: {
            invitedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

/**
 * Atomically claims an invitation for a registered user.
 */
export async function claimInvitationTransaction(
    token: string,
    userId: string,
    userEmail?: string
): Promise<{ success: boolean; message?: string }> {
    return await prisma.$transaction(async (tx) => {
        const invitation = await tx.invitation.findUnique({
            where: { token },
        });

        const validation = validateInvitationStatus(invitation, userEmail);
        if (!validation.valid || !invitation) {
            return {
                success: false,
                message: validation.message || "Undangan tidak valid.",
            };
        }

        const newUsesCount = invitation.usesCount + 1;
        const newStatus = newUsesCount >= invitation.maxUses ? "ACCEPTED" : "PENDING";

        // Update invitation usage
        await tx.invitation.update({
            where: { id: invitation.id },
            data: {
                usesCount: newUsesCount,
                status: newStatus,
            },
        });

        // Link claimed user
        await tx.user.update({
            where: { id: userId },
            data: {
                invitationId: invitation.id,
            },
        });

        return {
            success: true,
        };
    });
}

/**
 * Revokes an existing invitation so it can no longer be used.
 */
export async function revokeInvitation(invitationId: string, invitedById: string) {
    const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
    });

    if (!invitation) {
        throw new Error("Undangan tidak ditemukan.");
    }

    if (invitation.invitedById !== invitedById) {
        throw new Error("Anda tidak memiliki izin untuk mencabut undangan ini.");
    }

    return await prisma.invitation.update({
        where: { id: invitationId },
        data: {
            status: "REVOKED",
        },
    });
}
