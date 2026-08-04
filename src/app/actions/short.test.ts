import { vi, describe, it, expect, beforeEach } from "vitest";
import { createShortLink, getShortLinks, deleteShortLink } from "./short";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { type User, type ShortLink } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    shortLink: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    microsite: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("short link actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getShortLinks", () => {
    it("should return empty array if user is not logged in", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const res = await getShortLinks();
      expect(res).toEqual([]);
    });

    it("should return short links for the logged in user", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_1", email: "test@example.com" } as unknown as User);
      const mockLinks = [{ id: "link_1", userId: "user_1", shortCode: "abc", originalUrl: "https://google.com" }];
      vi.mocked(prisma.shortLink.findMany).mockResolvedValue(mockLinks as unknown as ShortLink[]);

      const res = await getShortLinks();
      expect(res).toEqual(mockLinks);
      expect(prisma.shortLink.findMany).toHaveBeenCalledWith({
        where: { userId: "user_1" },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("createShortLink", () => {
    it("should return error if unauthorized", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const formData = new FormData();
      formData.append("originalUrl", "https://google.com");
      const res = await createShortLink(formData);
      expect(res).toEqual({ error: "Unauthorized" });
    });

    it("should return error if originalUrl is missing", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_1", email: "test@example.com" } as unknown as User);
      const formData = new FormData();
      const res = await createShortLink(formData);
      expect(res).toEqual({ error: "Original URL is required" });
    });

    it("should create short link with custom alias if unique", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_1", email: "test@example.com" } as unknown as User);
      vi.mocked(prisma.shortLink.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.microsite.findUnique).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("originalUrl", "https://google.com");
      formData.append("customAlias", "google");
      formData.append("password", "secret");

      const res = await createShortLink(formData);
      expect(res.success).toContain("Short link created!");
      expect(prisma.shortLink.create).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/links");
    });
  });

  describe("deleteShortLink", () => {
    it("should delete link if user owns it", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_1", email: "test@example.com" } as unknown as User);

      const res = await deleteShortLink("link_1");
      expect(res).toEqual({ success: "Short link deleted" });
      expect(prisma.shortLink.delete).toHaveBeenCalledWith({
        where: { id: "link_1", userId: "user_1" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/links");
    });
  });
});
