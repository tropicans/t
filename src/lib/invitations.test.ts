import { describe, it, expect, vi } from "vitest";
import {
    generateInvitationToken,
    validateInvitationStatus,
} from "./invitations";
import { RESERVED_SLUGS, validateSlugCollision } from "./validators";

describe("Invitation Validation & Engine", () => {
    describe("generateInvitationToken", () => {
        it("generates a high-entropy URL-safe token of length 24", () => {
            const token1 = generateInvitationToken();
            const token2 = generateInvitationToken();

            expect(token1).toHaveLength(24);
            expect(token2).toHaveLength(24);
            expect(token1).not.toEqual(token2);
            expect(token1).toMatch(/^[A-Za-z0-9_-]+$/);
        });
    });

    describe("validateInvitationStatus", () => {
        const baseInvitation = {
            id: "inv_123",
            token: "tok_abc",
            email: null,
            invitedById: "usr_admin",
            maxUses: 1,
            usesCount: 0,
            expiresAt: null,
            status: "PENDING",
        };

        it("returns NOT_FOUND when invitation does not exist", () => {
            const result = validateInvitationStatus(null);
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("NOT_FOUND");
        });

        it("returns REVOKED when status is REVOKED", () => {
            const result = validateInvitationStatus({
                ...baseInvitation,
                status: "REVOKED",
            });
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("REVOKED");
        });

        it("returns EXPIRED when status is marked EXPIRED", () => {
            const result = validateInvitationStatus({
                ...baseInvitation,
                status: "EXPIRED",
            });
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("EXPIRED");
        });

        it("returns EXPIRED when expiresAt timestamp has passed", () => {
            const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
            const result = validateInvitationStatus({
                ...baseInvitation,
                expiresAt: pastDate,
            });
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("EXPIRED");
        });

        it("returns valid when expiresAt timestamp is in the future", () => {
            const futureDate = new Date(Date.now() + 3600000); // 1 hour in future
            const result = validateInvitationStatus({
                ...baseInvitation,
                expiresAt: futureDate,
            });
            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
        });

        it("returns EXHAUSTED when usesCount reaches maxUses", () => {
            const result = validateInvitationStatus({
                ...baseInvitation,
                maxUses: 2,
                usesCount: 2,
            });
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("EXHAUSTED");
        });

        it("returns EXHAUSTED when status is ACCEPTED", () => {
            const result = validateInvitationStatus({
                ...baseInvitation,
                status: "ACCEPTED",
            });
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("EXHAUSTED");
        });

        it("returns valid for open invitation with available quota", () => {
            const result = validateInvitationStatus({
                ...baseInvitation,
                email: null,
                maxUses: 5,
                usesCount: 2,
            });
            expect(result.valid).toBe(true);
        });

        it("returns valid when target email matches invitation email (case-insensitive and trimmed)", () => {
            const result = validateInvitationStatus(
                {
                    ...baseInvitation,
                    email: "member@example.com",
                },
                "  MEMBER@EXAMPLE.COM "
            );
            expect(result.valid).toBe(true);
        });

        it("returns EMAIL_MISMATCH when target email differs from invitation email", () => {
            const result = validateInvitationStatus(
                {
                    ...baseInvitation,
                    email: "allowed@example.com",
                },
                "other@example.com"
            );
            expect(result.valid).toBe(false);
            expect(result.reason).toBe("EMAIL_MISMATCH");
            expect(result.message).toContain("allowed@example.com");
        });
    });

    describe("Reserved Routes Protection", () => {
        it("includes 'invite' in RESERVED_SLUGS", () => {
            expect(RESERVED_SLUGS).toContain("invite");
        });

        it("rejects 'invite' as a short link alias or microsite slug via validateSlugCollision", async () => {
            await expect(validateSlugCollision("invite", undefined, false)).rejects.toThrow(
                'is a reserved route'
            );
            await expect(validateSlugCollision("INVITE", undefined, true)).rejects.toThrow(
                'is a reserved route'
            );
        });
    });
});
