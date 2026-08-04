import { vi, describe, it, expect, beforeEach } from "vitest";
import { verifyPasswordAndRedirect, trackShortLinkClick } from "./short-link-redirect";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcrypt";
import { type ShortLink } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    shortLink: {
      findUnique: vi.fn(),
    },
    shortLinkClick: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error("NEXT_REDIRECT");
    Object.assign(err, { digest: `NEXT_REDIRECT;${url};307;` });
    throw err;
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("short-link-redirect actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("trackShortLinkClick", () => {
    it("should create click tracking record", async () => {
      const mockHeaders = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === "user-agent") return "test-agent";
          if (key === "x-vercel-ip-country") return "ID";
          return null;
        }),
      };
      vi.mocked(headers).mockResolvedValue(mockHeaders as unknown as Awaited<ReturnType<typeof headers>>);

      await trackShortLinkClick({ id: "link_1" } as unknown as ShortLink);

      expect(prisma.shortLinkClick.create).toHaveBeenCalledWith({
        data: {
          shortLinkId: "link_1",
          userAgent: "test-agent",
          country: "ID",
        },
      });
    });
  });

  describe("verifyPasswordAndRedirect", () => {
    it("should redirect with error if password missing", async () => {
      const formData = new FormData();
      await expect(verifyPasswordAndRedirect("abc", formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/abc?error=Password is required");
    });

    it("should redirect with error if link or link password does not exist", async () => {
      vi.mocked(prisma.shortLink.findUnique).mockResolvedValue(null);
      const formData = new FormData();
      formData.append("password", "secret");

      await expect(verifyPasswordAndRedirect("abc", formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/abc?error=Invalid link");
    });

    it("should redirect to shortCode if link is expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      vi.mocked(prisma.shortLink.findUnique).mockResolvedValue({
        id: "link_1",
        shortCode: "abc",
        password: "hashed_password",
        expiresAt: pastDate,
      } as unknown as ShortLink);

      const formData = new FormData();
      formData.append("password", "secret");

      await expect(verifyPasswordAndRedirect("abc", formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/abc");
    });

    it("should redirect to error if password does not match", async () => {
      vi.mocked(prisma.shortLink.findUnique).mockResolvedValue({
        id: "link_1",
        shortCode: "abc",
        password: "hashed_password",
        expiresAt: null,
      } as unknown as ShortLink);

      const spyCompare = vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const formData = new FormData();
      formData.append("password", "wrong");

      await expect(verifyPasswordAndRedirect("abc", formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/abc?error=Incorrect password");
      spyCompare.mockRestore();
    });

    it("should redirect to originalUrl if password matches and not expired", async () => {
      vi.mocked(prisma.shortLink.findUnique).mockResolvedValue({
        id: "link_1",
        shortCode: "abc",
        password: "hashed_password",
        expiresAt: null,
        originalUrl: "https://example.com",
      } as unknown as ShortLink);

      const spyCompare = vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      const mockHeaders = {
        get: vi.fn().mockReturnValue("test-agent"),
      };
      vi.mocked(headers).mockResolvedValue(mockHeaders as unknown as Awaited<ReturnType<typeof headers>>);

      const formData = new FormData();
      formData.append("password", "secret");

      await expect(verifyPasswordAndRedirect("abc", formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(prisma.shortLinkClick.create).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("https://example.com");
      spyCompare.mockRestore();
    });
  });
});
