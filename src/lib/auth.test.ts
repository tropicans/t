import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { authorizeUserSignIn } from "./auth";
import { prisma } from "./prisma";
import * as invitationsLib from "./invitations";

vi.mock("./prisma", () => {
    const mockTx = {
        invitation: {
            update: vi.fn(),
        },
        user: {
            create: vi.fn(),
        },
    };

    return {
        prisma: {
            user: {
                findUnique: vi.fn(),
                update: vi.fn(),
                upsert: vi.fn(),
                create: vi.fn(),
            },
            invitation: {
                findUnique: vi.fn(),
                update: vi.fn(),
            },
            $transaction: vi.fn((callback) => callback(mockTx)),
            _mockTx: mockTx,
        },
    };
});

describe("authorizeUserSignIn (AUTH-01 & AUTH-02)", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        delete process.env.ALLOWED_EMAILS;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("Tier 1: Existing Database Users (AUTH-02)", () => {
        it("allows existing users to sign in without an invitation or allowlist", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_existing_123",
                email: "member@example.com",
                name: "Existing Member",
                image: "https://example.com/photo.jpg",
                emailVerified: null,
                invitationId: null,
                createdAt: new Date(),
            });
            vi.mocked(prisma.user.update).mockResolvedValue({} as any);

            const result = await authorizeUserSignIn({
                email: "member@example.com",
                name: "Updated Name",
            });

            expect(result.allowed).toBe(true);
            expect(result.reason).toBe("EXISTING_USER");
            expect(result.user?.id).toBe("user_existing_123");
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: "user_existing_123" },
                data: { name: "Updated Name", image: undefined },
            });
        });

        it("case-insensitively matches existing user email", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: "user_case_123",
                email: "case@example.com",
                name: "Case User",
                image: null,
                emailVerified: null,
                invitationId: null,
                createdAt: new Date(),
            });
            vi.mocked(prisma.user.update).mockResolvedValue({} as any);

            const result = await authorizeUserSignIn({
                email: "  CASE@EXAMPLE.COM  ",
            });

            expect(result.allowed).toBe(true);
            expect(result.reason).toBe("EXISTING_USER");
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "case@example.com" },
            });
        });
    });

    describe("Tier 2: Superadmin Bootstrap Allowlist (AUTH-02)", () => {
        it("allows login and upserts new user when email is in ALLOWED_EMAILS", async () => {
            process.env.ALLOWED_EMAILS = "admin@taut.id, super@taut.id";

            // User does not exist in DB yet
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.user.upsert).mockResolvedValue({
                id: "user_admin_999",
                email: "admin@taut.id",
                name: "Admin User",
                image: "",
                emailVerified: null,
                invitationId: null,
                createdAt: new Date(),
            });

            const result = await authorizeUserSignIn({
                email: "ADMIN@TAUT.ID",
                name: "Admin User",
            });

            expect(result.allowed).toBe(true);
            expect(result.reason).toBe("ALLOWED_EMAILS");
            expect(result.user?.id).toBe("user_admin_999");
            expect(prisma.user.upsert).toHaveBeenCalledWith({
                where: { email: "admin@taut.id" },
                create: {
                    email: "admin@taut.id",
                    name: "Admin User",
                    image: "",
                },
                update: {
                    name: "Admin User",
                    image: undefined,
                },
            });
        });
    });

    describe("Tier 3: Invitation Token Claims (AUTH-01)", () => {
        const mockInvitation = {
            id: "inv_token_123",
            token: "valid-secure-token-abc",
            email: null,
            invitedById: "admin_1",
            maxUses: 2,
            usesCount: 0,
            expiresAt: new Date(Date.now() + 86400000), // +1 day
            status: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("claims valid open invitation and provisions new user in transaction", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue(mockInvitation as any);

            const mockTx = (prisma as any)._mockTx;
            mockTx.invitation.update.mockResolvedValue({});
            mockTx.user.create.mockResolvedValue({
                id: "user_new_invited",
                email: "invitee@example.com",
                name: "Invited User",
            });

            const result = await authorizeUserSignIn({
                email: "invitee@example.com",
                name: "Invited User",
                inviteToken: "valid-secure-token-abc",
            });

            expect(result.allowed).toBe(true);
            expect(result.reason).toBe("INVITATION_CLAIMED");
            expect(result.user?.id).toBe("user_new_invited");

            // Verify transaction updates
            expect(mockTx.invitation.update).toHaveBeenCalledWith({
                where: { id: "inv_token_123" },
                data: {
                    usesCount: 1,
                    status: "PENDING",
                },
            });
            expect(mockTx.user.create).toHaveBeenCalledWith({
                data: {
                    email: "invitee@example.com",
                    name: "Invited User",
                    image: "",
                    invitationId: "inv_token_123",
                },
            });
        });

        it("sets status to ACCEPTED when usesCount reaches maxUses", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue({
                ...mockInvitation,
                maxUses: 1,
                usesCount: 0,
            } as any);

            const mockTx = (prisma as any)._mockTx;
            mockTx.invitation.update.mockResolvedValue({});
            mockTx.user.create.mockResolvedValue({
                id: "user_single_use",
                email: "single@example.com",
                name: "Single User",
            });

            const result = await authorizeUserSignIn({
                email: "single@example.com",
                inviteToken: "valid-secure-token-abc",
            });

            expect(result.allowed).toBe(true);
            expect(mockTx.invitation.update).toHaveBeenCalledWith({
                where: { id: "inv_token_123" },
                data: {
                    usesCount: 1,
                    status: "ACCEPTED",
                },
            });
        });

        it("allows email-specific invitation when Google email matches", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue({
                ...mockInvitation,
                email: "designated@example.com",
            } as any);

            const mockTx = (prisma as any)._mockTx;
            mockTx.user.create.mockResolvedValue({
                id: "user_designated",
                email: "designated@example.com",
                name: "Designated User",
            });

            const result = await authorizeUserSignIn({
                email: "DESIGNATED@example.com",
                inviteToken: "valid-secure-token-abc",
            });

            expect(result.allowed).toBe(true);
            expect(result.reason).toBe("INVITATION_CLAIMED");
        });

        it("rejects email-specific invitation when Google email does not match", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue({
                ...mockInvitation,
                email: "designated@example.com",
            } as any);

            const result = await authorizeUserSignIn({
                email: "intruder@example.com",
                inviteToken: "valid-secure-token-abc",
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("INVALID_INVITATION");
            expect(result.errorMessage).toContain("designated@example.com");
        });

        it("rejects expired invitation token", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue({
                ...mockInvitation,
                expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
            } as any);

            const result = await authorizeUserSignIn({
                email: "late@example.com",
                inviteToken: "expired-token",
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("INVALID_INVITATION");
        });

        it("rejects exhausted invitation token", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue({
                ...mockInvitation,
                maxUses: 1,
                usesCount: 1,
                status: "ACCEPTED",
            } as any);

            const result = await authorizeUserSignIn({
                email: "extra@example.com",
                inviteToken: "exhausted-token",
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("INVALID_INVITATION");
        });

        it("rejects revoked invitation token", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.spyOn(invitationsLib, "getInvitationByToken").mockResolvedValue({
                ...mockInvitation,
                status: "REVOKED",
            } as any);

            const result = await authorizeUserSignIn({
                email: "revoked@example.com",
                inviteToken: "revoked-token",
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("INVALID_INVITATION");
        });
    });

    describe("Unauthorized Fallback", () => {
        it("blocks unauthorized user when not in DB, not in ALLOWED_EMAILS, and no invitation token", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const result = await authorizeUserSignIn({
                email: "stranger@example.com",
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("UNAUTHORIZED");
        });

        it("blocks user with empty email string", async () => {
            const result = await authorizeUserSignIn({
                email: "",
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("UNAUTHORIZED");
        });
    });
});
