import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isUserAdmin } from "./admin";

describe("isUserAdmin Helper", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("returns false if email is null, undefined, or empty", () => {
        expect(isUserAdmin(null)).toBe(false);
        expect(isUserAdmin(undefined)).toBe(false);
        expect(isUserAdmin("")).toBe(false);
        expect(isUserAdmin("   ")).toBe(false);
    });

    it("returns true when email matches ALLOWED_EMAILS (case-insensitive)", () => {
        process.env.ALLOWED_EMAILS = "admin@example.com, superadmin@taut.dev ";

        expect(isUserAdmin("admin@example.com")).toBe(true);
        expect(isUserAdmin("ADMIN@EXAMPLE.COM")).toBe(true);
        expect(isUserAdmin("superadmin@taut.dev")).toBe(true);
        expect(isUserAdmin("SuperAdmin@taut.dev")).toBe(true);
    });

    it("returns true when email matches GLOBAL_DASHBOARD_VIEWER_EMAIL", () => {
        process.env.ALLOWED_EMAILS = "admin@example.com";
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer@taut.dev";

        expect(isUserAdmin("viewer@taut.dev")).toBe(true);
        expect(isUserAdmin("VIEWER@TAUT.DEV")).toBe(true);
    });

    it("returns false for regular users not in allowlists", () => {
        process.env.ALLOWED_EMAILS = "admin@example.com";
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer@taut.dev";

        expect(isUserAdmin("regular@example.com")).toBe(false);
        expect(isUserAdmin("other@gmail.com")).toBe(false);
    });
});
