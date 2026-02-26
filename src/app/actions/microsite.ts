"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Unauthorized");
    return user.id;
}

function validateSlug(slug: string): string {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!clean || clean.length < 2) throw new Error("Slug must be at least 2 characters");
    if (clean.length > 60) throw new Error("Slug must be under 60 characters");
    // Reserved routes
    const reserved = ["dashboard", "login", "api", "l", "_next", "favicon.ico"];
    if (reserved.includes(clean)) throw new Error(`"${clean}" is a reserved slug`);
    return clean;
}

// ── Microsite CRUD ─────────────────────────────────────────────────────────────

export async function createMicrosite(formData: FormData) {
    const userId = await getCurrentUserId();
    const slug = validateSlug(formData.get("slug") as string);
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const theme = (formData.get("theme") as string) || "dark";
    const coverImage = (formData.get("coverImage") as string)?.trim() || null;
    const avatarImage = (formData.get("avatarImage") as string)?.trim() || null;

    if (!title) throw new Error("Title is required");

    const existing = await prisma.microsite.findUnique({ where: { slug } });
    if (existing) throw new Error(`The slug "${slug}" is already taken`);

    const microsite = await prisma.microsite.create({
        data: { slug, title, description, theme, userId, coverImage, avatarImage },
    });

    revalidatePath("/dashboard/microsites");
    return { success: true, microsite };
}

export async function updateMicrosite(id: string, formData: FormData) {
    const userId = await getCurrentUserId();
    const microsite = await prisma.microsite.findUnique({ where: { id } });
    if (!microsite || microsite.userId !== userId) throw new Error("Not found");

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const theme = (formData.get("theme") as string) || microsite.theme;
    const isPublished = formData.get("isPublished") === "true";
    const coverImageRaw = (formData.get("coverImage") as string)?.trim();
    const coverImage = coverImageRaw || null;
    const avatarImageRaw = (formData.get("avatarImage") as string)?.trim();
    const avatarImage = avatarImageRaw || null;

    const updated = await prisma.microsite.update({
        where: { id },
        data: { title, description, theme, isPublished, coverImage, avatarImage },
    });

    revalidatePath(`/dashboard/microsites/${id}`);
    revalidatePath(`/${updated.slug}`);
    return { success: true, microsite: updated };
}

export async function deleteMicrosite(id: string) {
    const userId = await getCurrentUserId();
    const microsite = await prisma.microsite.findUnique({ where: { id } });
    if (!microsite || microsite.userId !== userId) throw new Error("Not found");

    await prisma.microsite.delete({ where: { id } });
    revalidatePath("/dashboard/microsites");
    return { success: true };
}

// ── Microsite Link CRUD ────────────────────────────────────────────────────────

export async function createMicrositeLink(micrositeId: string, formData: FormData) {
    const userId = await getCurrentUserId();
    const microsite = await prisma.microsite.findUnique({ where: { id: micrositeId } });
    if (!microsite || microsite.userId !== userId) throw new Error("Not found");

    const title = (formData.get("title") as string)?.trim();
    const url = (formData.get("url") as string)?.trim();
    const icon = (formData.get("icon") as string)?.trim() || null;

    if (!title || !url) throw new Error("Title and URL are required");

    // Get current max order
    const maxOrder = await prisma.micrositeLink.aggregate({
        where: { micrositeId },
        _max: { order: true },
    });

    const link = await prisma.micrositeLink.create({
        data: { title, url, icon, micrositeId, order: (maxOrder._max.order ?? -1) + 1 },
    });

    revalidatePath(`/dashboard/microsites/${micrositeId}`);
    return { success: true, link };
}

export async function updateMicrositeLink(linkId: string, formData: FormData) {
    const userId = await getCurrentUserId();
    const link = await prisma.micrositeLink.findUnique({
        where: { id: linkId },
        include: { microsite: true },
    });
    if (!link || link.microsite.userId !== userId) throw new Error("Not found");

    const title = (formData.get("title") as string)?.trim();
    const url = (formData.get("url") as string)?.trim();
    const icon = (formData.get("icon") as string)?.trim() || null;
    const isActive = formData.get("isActive") !== "false";

    const updated = await prisma.micrositeLink.update({
        where: { id: linkId },
        data: { title, url, icon, isActive },
    });

    revalidatePath(`/dashboard/microsites/${link.micrositeId}`);
    return { success: true, link: updated };
}

export async function deleteMicrositeLink(linkId: string) {
    const userId = await getCurrentUserId();
    const link = await prisma.micrositeLink.findUnique({
        where: { id: linkId },
        include: { microsite: true },
    });
    if (!link || link.microsite.userId !== userId) throw new Error("Not found");

    await prisma.micrositeLink.delete({ where: { id: linkId } });
    revalidatePath(`/dashboard/microsites/${link.micrositeId}`);
    return { success: true };
}

export async function reorderMicrositeLinks(micrositeId: string, orderedIds: string[]) {
    const userId = await getCurrentUserId();
    const microsite = await prisma.microsite.findUnique({ where: { id: micrositeId } });
    if (!microsite || microsite.userId !== userId) throw new Error("Not found");

    await Promise.all(
        orderedIds.map((id, index) =>
            prisma.micrositeLink.update({ where: { id }, data: { order: index } })
        )
    );

    revalidatePath(`/dashboard/microsites/${micrositeId}`);
    return { success: true };
}
