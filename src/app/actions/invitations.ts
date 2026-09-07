"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createInvitation, revokeInvitation } from "@/lib/invitations";
import { isGlobalDashboardViewer } from "@/lib/microsite-access";
import { isUserAdmin } from "@/lib/admin";

// Helper: get DB user from session email
async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    return prisma.user.findUnique({ where: { email: session.user.email } });
}

export interface CreateInvitationInput {
    email?: string | null;
    maxUses?: number;
    expiresInDays?: number | null;
}

export async function createInvitationAction(input: CreateInvitationInput) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: "Sesi tidak valid atau tidak terotentikasi." };
    }

    if (!isUserAdmin(user.email)) {
        return { error: "Hanya admin yang memiliki izin untuk membuat undangan." };
    }

    let cleanedEmail: string | null = null;
    if (input.email && input.email.trim() !== "") {
        cleanedEmail = input.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanedEmail)) {
            return { error: "Format alamat email tidak valid." };
        }
    }

    const maxUses = input.maxUses ? Math.max(1, Math.floor(Number(input.maxUses))) : 1;
    const expiresInDays = input.expiresInDays && Number(input.expiresInDays) > 0 ? Number(input.expiresInDays) : null;

    try {
        const invitation = await createInvitation({
            invitedById: user.id,
            email: cleanedEmail,
            maxUses,
            expiresInDays,
        });

        revalidatePath("/dashboard/invitations");
        return {
            success: true,
            invitation: {
                id: invitation.id,
                token: invitation.token,
                email: invitation.email,
                maxUses: invitation.maxUses,
                usesCount: invitation.usesCount,
                expiresAt: invitation.expiresAt?.toISOString() || null,
                status: invitation.status,
                createdAt: invitation.createdAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Error creating invitation:", error);
        return { error: error instanceof Error ? error.message : "Gagal membuat tautan undangan." };
    }
}

export async function revokeInvitationAction(invitationId: string) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: "Sesi tidak valid atau tidak terotentikasi." };
    }

    if (!isUserAdmin(user.email)) {
        return { error: "Hanya admin yang memiliki izin untuk mencabut undangan." };
    }

    if (!invitationId) {
        return { error: "ID undangan harus diisi." };
    }

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) {
            return { error: "Undangan tidak ditemukan." };
        }

        const isViewer = isGlobalDashboardViewer(user.email);
        if (invitation.invitedById !== user.id && !isViewer) {
            return { error: "Anda tidak memiliki izin untuk mencabut undangan ini." };
        }

        if (invitation.invitedById === user.id) {
            await revokeInvitation(invitationId, user.id);
        } else {
            await prisma.invitation.update({
                where: { id: invitationId },
                data: { status: "REVOKED" },
            });
        }

        revalidatePath("/dashboard/invitations");
        return { success: true };
    } catch (error) {
        console.error("Error revoking invitation:", error);
        return { error: error instanceof Error ? error.message : "Gagal mencabut undangan." };
    }
}
