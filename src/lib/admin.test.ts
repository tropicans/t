import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isUserAdmin, isUserOperator, resolveUserRole, getAllUsersForAdmin } from "./admin";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findMany: vi.fn(),
        },
    },
}));

describe("RBAC Role Helpers", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("isUserAdmin", () => {
        it("returns false if email is null, undefined, or empty without admin dbRole", () => {
            expect(isUserAdmin(null)).toBe(false);
            expect(isUserAdmin(undefined)).toBe(false);
            expect(isUserAdmin("")).toBe(false);
            expect(isUserAdmin("   ")).toBe(false);
        });

        it("returns true if dbRole is ADMIN even without email", () => {
            expect(isUserAdmin(null, "ADMIN")).toBe(true);
            expect(isUserAdmin("someone@example.com", "ADMIN")).toBe(true);
        });

        it("returns true when email matches ALLOWED_EMAILS (case-insensitive)", () => {
            process.env.ALLOWED_EMAILS = "admin@example.com, superadmin@taut.dev ";

            expect(isUserAdmin("admin@example.com")).toBe(true);
            expect(isUserAdmin("ADMIN@EXAMPLE.COM")).toBe(true);
            expect(isUserAdmin("superadmin@taut.dev")).toBe(true);
            expect(isUserAdmin("SuperAdmin@taut.dev")).toBe(true);
        });

        it("returns false for regular users and viewers", () => {
            process.env.ALLOWED_EMAILS = "admin@example.com";
            process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer@taut.dev";

            expect(isUserAdmin("viewer@taut.dev")).toBe(false);
            expect(isUserAdmin("regular@example.com")).toBe(false);
        });
    });

    describe("isUserOperator", () => {
        it("returns true when email matches GLOBAL_DASHBOARD_VIEWER_EMAIL", () => {
            process.env.ALLOWED_EMAILS = "admin@example.com";
            process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer@taut.dev";

            expect(isUserOperator("viewer@taut.dev")).toBe(true);
            expect(isUserOperator("VIEWER@TAUT.DEV")).toBe(true);
        });

        it("returns true for comma-separated GLOBAL_DASHBOARD_VIEWER_EMAIL", () => {
            process.env.ALLOWED_EMAILS = "admin@example.com";
            process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer1@taut.dev, viewer2@taut.dev";

            expect(isUserOperator("viewer1@taut.dev")).toBe(true);
            expect(isUserOperator("viewer2@taut.dev")).toBe(true);
            expect(isUserOperator("other@taut.dev")).toBe(false);
        });

        it("returns true when dbRole is OPERATOR and not ADMIN", () => {
            expect(isUserOperator("user@example.com", "OPERATOR")).toBe(true);
        });

        it("returns false if user is an ADMIN", () => {
            process.env.ALLOWED_EMAILS = "admin@example.com";
            process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "admin@example.com";

            expect(isUserOperator("admin@example.com")).toBe(false);
        });
    });

    describe("resolveUserRole", () => {
        it("resolves ADMIN for allowed emails or ADMIN dbRole", () => {
            process.env.ALLOWED_EMAILS = "admin@taut.id";
            expect(resolveUserRole("admin@taut.id")).toBe("ADMIN");
            expect(resolveUserRole("other@taut.id", "ADMIN")).toBe("ADMIN");
        });

        it("resolves OPERATOR for viewer emails or OPERATOR dbRole", () => {
            process.env.ALLOWED_EMAILS = "admin@taut.id";
            process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "op@taut.id";

            expect(resolveUserRole("op@taut.id")).toBe("OPERATOR");
            expect(resolveUserRole("custom@taut.id", "OPERATOR")).toBe("OPERATOR");
        });

        it("resolves MEMBER for regular users", () => {
            process.env.ALLOWED_EMAILS = "admin@taut.id";
            process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "op@taut.id";

            expect(resolveUserRole("regular@taut.id")).toBe("MEMBER");
            expect(resolveUserRole("regular@taut.id", "MEMBER")).toBe("MEMBER");
        });
    });
});

describe("getAllUsersForAdmin", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
        process.env.ALLOWED_EMAILS = "admin@taut.id";
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("fetches all registered users, maps isAdmin flag and relations correctly", async () => {
        const mockUsers = [
            {
                id: "user_1",
                name: "Admin Person",
                email: "admin@taut.id",
                image: "https://avatar.com/admin.png",
                createdAt: new Date("2026-09-01"),
                invitationId: null,
                invitation: null,
                _count: {
                    shortLinks: 5,
                    microsites: 2,
                },
            },
            {
                id: "user_2",
                name: "Regular Member",
                email: "member@example.com",
                image: null,
                createdAt: new Date("2026-09-05"),
                invitationId: "inv_123",
                invitation: {
                    id: "inv_123",
                    token: "tok_xyz",
                    invitedBy: {
                        id: "user_1",
                        name: "Admin Person",
                        email: "admin@taut.id",
                    },
                },
                _count: {
                    shortLinks: 1,
                    microsites: 0,
                },
            },
        ];

        vi.mocked(prisma.user.findMany).mockResolvedValue(
            mockUsers as unknown as Awaited<ReturnType<typeof prisma.user.findMany>>
        );

        const result = await getAllUsersForAdmin();

        expect(prisma.user.findMany).toHaveBeenCalledWith({
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

        expect(result).toHaveLength(2);
        expect(result[0].isAdmin).toBe(true);
        expect(result[0].isOperator).toBe(false);
        expect(result[0].role).toBe("ADMIN");
        expect(result[0].email).toBe("admin@taut.id");
        expect(result[1].isAdmin).toBe(false);
        expect(result[1].isOperator).toBe(false);
        expect(result[1].role).toBe("MEMBER");
        expect(result[1].invitation?.token).toBe("tok_xyz");
        expect(result[1]._count.shortLinks).toBe(1);
    });
});

