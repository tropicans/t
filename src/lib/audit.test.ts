import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAuditEvent, getRecentAuditLogs } from "./audit";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        auditLog: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe("Audit Logging Engine (src/lib/audit.ts)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("logAuditEvent", () => {
        it("records an audit event successfully", async () => {
            const mockRecord = {
                id: "audit_1",
                userId: "user_123",
                userEmail: "admin@example.com",
                userName: "Admin User",
                action: "SHORT_LINK_CREATE",
                entity: "ShortLink",
                entityId: "link_999",
                details: { shortCode: "custom-code" },
                ipAddress: "127.0.0.1",
                createdAt: new Date(),
            };

            vi.mocked(prisma.auditLog.create).mockResolvedValue(mockRecord as any);

            const result = await logAuditEvent({
                userId: "user_123",
                userEmail: "admin@example.com",
                userName: "Admin User",
                action: "SHORT_LINK_CREATE",
                entity: "ShortLink",
                entityId: "link_999",
                details: { shortCode: "custom-code" },
                ipAddress: "127.0.0.1",
            });

            expect(result).toEqual(mockRecord);
            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    userId: "user_123",
                    userEmail: "admin@example.com",
                    userName: "Admin User",
                    action: "SHORT_LINK_CREATE",
                    entity: "ShortLink",
                    entityId: "link_999",
                    details: { shortCode: "custom-code" },
                    ipAddress: "127.0.0.1",
                },
            });
        });

        it("handles optional / missing fields gracefully", async () => {
            vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "audit_2" } as any);

            await logAuditEvent({
                action: "TEST_ACTION",
                entity: "TestEntity",
            });

            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    userId: null,
                    userEmail: null,
                    userName: null,
                    action: "TEST_ACTION",
                    entity: "TestEntity",
                    entityId: null,
                    details: undefined,
                    ipAddress: null,
                },
            });
        });

        it("catches internal errors and returns null without throwing", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            vi.mocked(prisma.auditLog.create).mockRejectedValue(new Error("DB Connection Failed"));

            const result = await logAuditEvent({
                action: "CRITICAL_ACTION",
                entity: "User",
            });

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("getRecentAuditLogs", () => {
        it("queries audit logs with default limit of 50 and descending order", async () => {
            const mockLogs = [
                { id: "audit_1", action: "MICROSITE_CREATE", createdAt: new Date() },
                { id: "audit_2", action: "SHORT_LINK_CREATE", createdAt: new Date() },
            ];
            vi.mocked(prisma.auditLog.findMany).mockResolvedValue(mockLogs as any);

            const logs = await getRecentAuditLogs();
            expect(logs).toEqual(mockLogs);
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
                where: {
                    action: undefined,
                    entity: undefined,
                    userId: undefined,
                },
                orderBy: { createdAt: "desc" },
                take: 50,
            });
        });

        it("applies filtering and custom limit when provided", async () => {
            vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

            await getRecentAuditLogs({
                limit: 10,
                action: "INVITATION_CREATE",
                entity: "Invitation",
                userId: "user_abc",
            });

            expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
                where: {
                    action: "INVITATION_CREATE",
                    entity: "Invitation",
                    userId: "user_abc",
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            });
        });
    });
});
