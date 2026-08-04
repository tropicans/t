import { vi, describe, it, expect, beforeEach } from "vitest";
import { updateMicrosite } from "./microsite";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { type User, type Microsite, type ShortLink } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    shortLink: {
      findUnique: vi.fn(),
    },
    microsite: {
      findUnique: vi.fn(),
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

describe("microsite actions - updateMicrosite", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockUser = { id: "user_1", email: "test@example.com" } as unknown as User;
  const mockMicrosite = {
    id: "microsite_1",
    slug: "mysite",
    title: "My Site",
    description: "Personal page",
    theme: "dark",
    isPublished: true,
    userId: "user_1",
  } as unknown as Microsite;

  it("should return error if unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const formData = new FormData();
    formData.append("title", "New Title");

    await expect(updateMicrosite("microsite_1", formData)).rejects.toThrow("Unauthorized");
  });

  it("should update other fields without changing the slug", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.microsite.findUnique).mockResolvedValue(mockMicrosite);
    vi.mocked(prisma.microsite.update).mockResolvedValue({
      ...mockMicrosite,
      title: "Updated Title",
    } as unknown as Microsite);

    const formData = new FormData();
    formData.append("title", "Updated Title");

    const res = await updateMicrosite("microsite_1", formData);
    expect(res.success).toBe(true);
    expect(res.microsite.title).toBe("Updated Title");
    expect(res.microsite.slug).toBe("mysite"); // Remains unchanged
    expect(prisma.microsite.update).toHaveBeenCalledWith({
      where: { id: "microsite_1" },
      data: expect.objectContaining({
        title: "Updated Title",
        slug: "mysite",
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/microsites/microsite_1");
    expect(revalidatePath).toHaveBeenCalledWith("/mysite");
    expect(revalidatePath).not.toHaveBeenCalledWith("/dashboard/microsites");
  });

  it("should update slug successfully when it is unique and clean", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    // Return mockMicrosite for findUnique (used to retrieve old slug and verify access)
    // Return null for findUnique checks in validateSlugCollision (no conflicts)
    vi.mocked(prisma.microsite.findUnique)
      .mockResolvedValueOnce(mockMicrosite) // 1. Retrieve for getEditableMicrosite
      .mockResolvedValueOnce(null); // 2. Inside validateSlugCollision (microsite check)
    vi.mocked(prisma.shortLink.findUnique).mockResolvedValue(null); // Inside validateSlugCollision (short link check)

    vi.mocked(prisma.microsite.update).mockResolvedValue({
      ...mockMicrosite,
      slug: "new-cool-site",
    } as unknown as Microsite);

    const formData = new FormData();
    formData.append("slug", "New Cool Site!"); // Will be sanitized to "new-cool-site"

    const res = await updateMicrosite("microsite_1", formData);
    expect(res.success).toBe(true);
    expect(res.microsite.slug).toBe("new-cool-site");
    expect(prisma.microsite.update).toHaveBeenCalledWith({
      where: { id: "microsite_1" },
      data: expect.objectContaining({
        slug: "new-cool-site",
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/microsites/microsite_1");
    expect(revalidatePath).toHaveBeenCalledWith("/mysite"); // Old slug path
    expect(revalidatePath).toHaveBeenCalledWith("/new-cool-site"); // New slug path
  });

  it("should throw error and NOT update database if slug collides with a short link", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.microsite.findUnique).mockResolvedValue(mockMicrosite);
    // Simulate short link collision
    vi.mocked(prisma.shortLink.findUnique).mockResolvedValue({
      id: "link_1",
      shortCode: "colliding-code",
    } as unknown as ShortLink);

    const formData = new FormData();
    formData.append("slug", "colliding-code");

    await expect(updateMicrosite("microsite_1", formData)).rejects.toThrow(
      "This alias/slug is already taken by a short link."
    );
    expect(prisma.microsite.update).not.toHaveBeenCalled();
  });

  it("should throw error and NOT update database if slug collides with another microsite", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    // First call returns current microsite (for getEditableMicrosite)
    // Second call returns a different colliding microsite (for validateSlugCollision check)
    vi.mocked(prisma.microsite.findUnique)
      .mockResolvedValueOnce(mockMicrosite)
      .mockResolvedValueOnce({
        id: "microsite_2",
        slug: "other-site",
      } as unknown as Microsite);

    const formData = new FormData();
    formData.append("slug", "other-site");

    await expect(updateMicrosite("microsite_1", formData)).rejects.toThrow(
      "This alias/slug is already taken by a microsite."
    );
    expect(prisma.microsite.update).not.toHaveBeenCalled();
  });

  it("should allow keeping the current slug (self-collision check bypass)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.shortLink.findUnique).mockResolvedValue(null);
    // First call: getEditableMicrosite -> mockMicrosite
    // Second call: validateSlugCollision -> mockMicrosite (same ID, so it is allowed!)
    vi.mocked(prisma.microsite.findUnique)
      .mockResolvedValueOnce(mockMicrosite)
      .mockResolvedValueOnce(mockMicrosite);

    vi.mocked(prisma.microsite.update).mockResolvedValue({
      ...mockMicrosite,
      slug: "mysite",
    } as unknown as Microsite);

    const formData = new FormData();
    formData.append("slug", "mysite");

    const res = await updateMicrosite("microsite_1", formData);
    expect(res.success).toBe(true);
    expect(res.microsite.slug).toBe("mysite");
    expect(prisma.microsite.update).toHaveBeenCalled();
  });
});
