"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isUserAdmin } from "@/lib/admin";
import { logAuditEvent } from "@/lib/audit";
import { Role } from "@prisma/client";

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    return prisma.user.findUnique({ where: { email: session.user.email } });
}

export interface UpdateUserRoleInput {
    userId: string;
    newRole: "ADMIN" | "OPERATOR" | "MEMBER";
}

export async function updateUserRoleAction(input: UpdateUserRoleInput) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return { error: "Sesi tidak valid atau tidak terotentikasi." };
    }

    if (!isUserAdmin(currentUser.email, currentUser.role)) {
        return { error: "Hanya admin yang memiliki izin untuk mengubah role pengguna." };
    }

    const { userId, newRole } = input;
    if (!userId) {
        return { error: "ID pengguna target harus diisi." };
    }

    const validRoles = ["ADMIN", "OPERATOR", "MEMBER"];
    if (!validRoles.includes(newRole)) {
        return { error: "Role yang dipilih tidak valid." };
    }

    // Prevent self-lockout: Admin cannot demote or change their own role
    if (currentUser.id === userId) {
        return { error: "Anda tidak dapat mengubah role akun Anda sendiri untuk mencegah lockout." };
    }

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return { error: "Pengguna tidak ditemukan." };
        }

        const oldRole = targetUser.role;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole as Role },
        });

        await logAuditEvent({
            userId: currentUser.id,
            userEmail: currentUser.email,
            userName: currentUser.name,
            action: "USER_ROLE_UPDATE",
            entity: "User",
            entityId: userId,
            details: {
                targetEmail: targetUser.email,
                targetName: targetUser.name,
                oldRole,
                newRole,
            },
        });

        revalidatePath("/dashboard/invitations");
        return { success: true, role: updatedUser.role };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { error: error instanceof Error ? error.message : "Gagal memperbarui role pengguna." };
    }
}
