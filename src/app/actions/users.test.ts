import { vi, describe, it, expect, beforeEach } from "vitest";
import { updateUserRoleAction } from "./users";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
    },
}));

vi.mock("next-auth", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("User Role Server Actions (UI-01 & TEST-01)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.ALLOWED_EMAILS = "admin@example.com";
    });

    it("rejects unauthenticated requests", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null);

        const res = await updateUserRoleAction({ userId: "user_target", newRole: "ADMIN" });
        expect(res.error).toContain("tidak valid atau tidak terotentikasi");
    });

    it("rejects non-admin users attempting to change roles", async () => {
        vi.mocked(getServerSession).mockResolvedValue({
            user: { email: "member@example.com" },
        });
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user_member",
            email: "member@example.com",
            role: "MEMBER",
        } as any);

        const res = await updateUserRoleAction({ userId: "user_target", newRole: "ADMIN" });
        expect(res.error).toContain("Hanya admin yang memiliki izin");
    });

    it("rejects invalid role inputs", async () => {
        vi.mocked(getServerSession).mockResolvedValue({
            user: { email: "admin@example.com" },
        });
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user_admin",
            email: "admin@example.com",
            role: "ADMIN",
        } as any);

        const res = await updateUserRoleAction({ userId: "user_target", newRole: "SUPER_GOD" as any });
        expect(res.error).toContain("Role yang dipilih tidak valid");
    });

    it("prevents self-lockout when admin tries to change their own role", async () => {
        vi.mocked(getServerSession).mockResolvedValue({
            user: { email: "admin@example.com" },
        });
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user_admin",
            email: "admin@example.com",
            role: "ADMIN",
        } as any);

        const res = await updateUserRoleAction({ userId: "user_admin", newRole: "MEMBER" });
        expect(res.error).toContain("tidak dapat mengubah role akun Anda sendiri untuk mencegah lockout");
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("returns error if target user is not found", async () => {
        vi.mocked(getServerSession).mockResolvedValue({
            user: { email: "admin@example.com" },
        });
        vi.mocked(prisma.user.findUnique)
            .mockResolvedValueOnce({
                id: "user_admin",
                email: "admin@example.com",
                role: "ADMIN",
            } as any)
            .mockResolvedValueOnce(null);

        const res = await updateUserRoleAction({ userId: "nonexistent_id", newRole: "OPERATOR" });
        expect(res.error).toContain("Pengguna tidak ditemukan");
    });

    it("updates target user role and emits audit log successfully", async () => {
        vi.mocked(getServerSession).mockResolvedValue({
            user: { email: "admin@example.com" },
        });
        vi.mocked(prisma.user.findUnique)
            .mockResolvedValueOnce({
                id: "user_admin",
                email: "admin@example.com",
                name: "Admin User",
                role: "ADMIN",
            } as any)
            .mockResolvedValueOnce({
                id: "user_target",
                email: "colleague@example.com",
                name: "Colleague",
                role: "MEMBER",
            } as any);

        vi.mocked(prisma.user.update).mockResolvedValue({
            id: "user_target",
            role: "OPERATOR",
        } as any);

        const res = await updateUserRoleAction({ userId: "user_target", newRole: "OPERATOR" });
        expect(res.success).toBe(true);
        expect(res.role).toBe("OPERATOR");
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: "user_target" },
            data: { role: "OPERATOR" },
        });
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invitations");
    });
});
