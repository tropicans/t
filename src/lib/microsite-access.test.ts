import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isGlobalDashboardViewer, isGlobalMicrositeViewer } from "./microsite-access";

describe("isGlobalDashboardViewer", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("returns false if email is null, undefined, or empty", () => {
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer@taut.dev";
        expect(isGlobalDashboardViewer(null)).toBe(false);
        expect(isGlobalDashboardViewer(undefined)).toBe(false);
        expect(isGlobalDashboardViewer("")).toBe(false);
        expect(isGlobalDashboardViewer("   ")).toBe(false);
    });

    it("returns false if no env variable is set", () => {
        delete process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL;
        delete process.env.GLOBAL_MICROSITE_VIEWER_EMAIL;
        expect(isGlobalDashboardViewer("viewer@taut.dev")).toBe(false);
    });

    it("matches single email (case-insensitive with trimming)", () => {
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "viewer@taut.dev";
        expect(isGlobalDashboardViewer("viewer@taut.dev")).toBe(true);
        expect(isGlobalDashboardViewer("VIEWER@TAUT.DEV")).toBe(true);
        expect(isGlobalDashboardViewer("  viewer@taut.dev  ")).toBe(true);
        expect(isGlobalDashboardViewer("other@taut.dev")).toBe(false);
    });

    it("matches multiple comma-separated emails", () => {
        process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL = "isnairawati@gmail.com, tropicans@gmail.com, admin@taut.id";

        expect(isGlobalDashboardViewer("isnairawati@gmail.com")).toBe(true);
        expect(isGlobalDashboardViewer("ISNAIRAWATI@GMAIL.COM")).toBe(true);
        expect(isGlobalDashboardViewer("tropicans@gmail.com")).toBe(true);
        expect(isGlobalDashboardViewer("admin@taut.id")).toBe(true);
        expect(isGlobalDashboardViewer("other@gmail.com")).toBe(false);
    });

    it("falls back to GLOBAL_MICROSITE_VIEWER_EMAIL when GLOBAL_DASHBOARD_VIEWER_EMAIL is unset", () => {
        delete process.env.GLOBAL_DASHBOARD_VIEWER_EMAIL;
        process.env.GLOBAL_MICROSITE_VIEWER_EMAIL = "user1@taut.dev, user2@taut.dev";

        expect(isGlobalDashboardViewer("user1@taut.dev")).toBe(true);
        expect(isGlobalDashboardViewer("user2@taut.dev")).toBe(true);
        expect(isGlobalDashboardViewer("user3@taut.dev")).toBe(false);
    });

    it("ensures isGlobalMicrositeViewer is an alias to isGlobalDashboardViewer", () => {
        expect(isGlobalMicrositeViewer).toBe(isGlobalDashboardViewer);
    });
});
