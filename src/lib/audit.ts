import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface LogAuditEventInput {
    userId?: string | null;
    userEmail?: string | null;
    userName?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    details?: Record<string, unknown> | null;
    ipAddress?: string | null;
}

/**
 * Records an activity event to the AuditLog table asynchronously.
 * Catches any internal error so business transactions are never blocked.
 */
export async function logAuditEvent(input: LogAuditEventInput) {
    try {
        if (!prisma?.auditLog?.create) {
            return null;
        }
        return await prisma.auditLog.create({
            data: {
                userId: input.userId || null,
                userEmail: input.userEmail || null,
                userName: input.userName || null,
                action: input.action,
                entity: input.entity,
                entityId: input.entityId || null,
                details: (input.details ?? undefined) as Prisma.InputJsonValue | undefined,
                ipAddress: input.ipAddress || null,
            },
        });
    } catch (error) {
        console.error("[AUDIT_LOG_ERROR] Failed to record audit event:", error, input);
        return null;
    }
}

export interface GetAuditLogsOptions {
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
}

export async function getRecentAuditLogs(options: GetAuditLogsOptions = {}) {
    if (!prisma?.auditLog?.findMany) {
        return [];
    }
    const { limit = 50, action, entity, userId } = options;
    return prisma.auditLog.findMany({
        where: {
            action: action || undefined,
            entity: entity || undefined,
            userId: userId || undefined,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

