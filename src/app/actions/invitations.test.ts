import { vi, describe, it, expect, beforeEach } from "vitest";
import { createInvitationAction, revokeInvitationAction } from "./invitations";
import { getUserInvitations } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
        invitation: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("next-auth", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("Invitation Actions & Queries (ADMIN-01 & TEST-01)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.ALLOWED_EMAILS = "admin@example.com,owner@example.com";
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "globalviewer@example.com";
    });

    describe("createInvitationAction", () => {
        it("returns error if unauthenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const res = await createInvitationAction({ maxUses: 5 });
            expect(res.error).toContain("tidak valid atau tidak terotentikasi");
        });

        it("rejects creation if user is not an admin", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "regular@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_regular",
                email: "regular@example.com",
            } as any);

            const res = await createInvitationAction({ maxUses: 5 });
            expect(res.error).toContain("Hanya admin yang memiliki izin untuk membuat undangan.");
        });

        it("returns error if email format is invalid", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "admin@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_admin",
                email: "admin@example.com",
            } as any);

            const res = await createInvitationAction({ email: "invalid-email-address" });
            expect(res.error).toContain("Format alamat email tidak valid");
        });

        it("creates open invitation link with custom quota and expiry", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "admin@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_admin",
                email: "admin@example.com",
            } as any);

            const mockCreated = {
                id: "inv_123",
                token: "token_abc_xyz_1234567890",
                email: null,
                invitedById: "user_admin",
                maxUses: 10,
                usesCount: 0,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: "PENDING",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            vi.mocked(prisma.invitation.create).mockResolvedValue(mockCreated as any);

            const res = await createInvitationAction({
                maxUses: 10,
                expiresInDays: 7,
            });

            expect(res.success).toBe(true);
            expect(res.invitation?.token).toBe("token_abc_xyz_1234567890");
            expect(res.invitation?.maxUses).toBe(10);
            expect(prisma.invitation.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        invitedById: "user_admin",
                        email: null,
                        maxUses: 10,
                        status: "PENDING",
                    }),
                })
            );
            expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invitations");
        });

        it("creates email-specific invitation link", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "admin@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_admin",
                email: "admin@example.com",
            } as any);

            const mockCreated = {
                id: "inv_456",
                token: "token_email_restricted_123",
                email: "friend@example.com",
                invitedById: "user_admin",
                maxUses: 1,
                usesCount: 0,
                expiresAt: null,
                status: "PENDING",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            vi.mocked(prisma.invitation.create).mockResolvedValue(mockCreated as any);

            const res = await createInvitationAction({
                email: "Friend@Example.COM",
                maxUses: 1,
                expiresInDays: null,
            });

            expect(res.success).toBe(true);
            expect(res.invitation?.email).toBe("friend@example.com");
            expect(prisma.invitation.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        email: "friend@example.com",
                        maxUses: 1,
                    }),
                })
            );
        });
    });

    describe("revokeInvitationAction", () => {
        it("returns error if unauthenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const res = await revokeInvitationAction("inv_123");
            expect(res.error).toContain("tidak valid atau tidak terotentikasi");
        });

        it("returns error if invitation not found", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "admin@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_admin",
                email: "admin@example.com",
            } as any);
            vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

            const res = await revokeInvitationAction("inv_nonexistent");
            expect(res.error).toContain("tidak ditemukan");
        });

        it("rejects revocation if user is not an admin", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "regular@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_regular",
                email: "regular@example.com",
            } as any);

            const res = await revokeInvitationAction("inv_123");
            expect(res.error).toContain("Hanya admin yang memiliki izin untuk mencabut undangan.");
            expect(prisma.invitation.update).not.toHaveBeenCalled();
        });

        it("rejects revocation by an admin who is not the creator or global viewer", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "admin@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_admin",
                email: "admin@example.com",
            } as any);
            vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
                id: "inv_123",
                invitedById: "user_owner",
                status: "PENDING",
            } as any);

            const res = await revokeInvitationAction("inv_123");
            expect(res.error).toContain("tidak memiliki izin");
            expect(prisma.invitation.update).not.toHaveBeenCalled();
        });

        it("allows creator to revoke active invitation", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { email: "owner@example.com" },
            });
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_owner",
                email: "owner@example.com",
            } as any);
            vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
                id: "inv_123",
                invitedById: "user_owner",
                status: "PENDING",
            } as any);
            vi.mocked(prisma.invitation.update).mockResolvedValue({
                id: "inv_123",
                status: "REVOKED",
            } as any);

            const res = await revokeInvitationAction("inv_123");
            expect(res.success).toBe(true);
            expect(prisma.invitation.update).toHaveBeenCalledWith({
                where: { id: "inv_123" },
                data: { status: "REVOKED" },
            });
            expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invitations");
        });
    });

    describe("getUserInvitations query helper", () => {
        it("queries invitations restricted to user when not global viewer", async () => {
            const mockInvitations = [
                {
                    id: "inv_1",
                    token: "token1",
                    invitedById: "user_123",
                    status: "PENDING",
                    claimedUsers: [],
                },
            ];
            vi.mocked(prisma.invitation.findMany).mockResolvedValue(mockInvitations as any);

            const res = await getUserInvitations("user_123", false);
            expect(res).toEqual(mockInvitations);
            expect(prisma.invitation.findMany).toHaveBeenCalledWith({
                where: { invitedById: "user_123" },
                include: expect.objectContaining({
                    claimedUsers: expect.anything(),
                    invitedBy: expect.anything(),
                }),
                orderBy: { createdAt: "desc" },
            });
        });

        it("queries all invitations when global viewer", async () => {
            const mockInvitations = [
                { id: "inv_1", token: "token1", invitedById: "user_123" },
                { id: "inv_2", token: "token2", invitedById: "user_456" },
            ];
            vi.mocked(prisma.invitation.findMany).mockResolvedValue(mockInvitations as any);

            const res = await getUserInvitations("user_123", true);
            expect(res).toEqual(mockInvitations);
            expect(prisma.invitation.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: expect.objectContaining({
                    claimedUsers: expect.anything(),
                    invitedBy: expect.anything(),
                }),
                orderBy: { createdAt: "desc" },
            });
        });
    });
});
