"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isGlobalDashboardViewer } from "@/lib/microsite-access";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { normalizeMicrositeTheme } from "@/lib/microsite-themes";
import { validateAndCorrectUrl, validateSlugCollision } from "@/lib/validators";

// ── Helpers ────────────────────────────────────────────────────────────────────

interface CurrentUserAccess {
    userId: string;
    canManageAllMicrosites: boolean;
}

async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Unauthorized");

    return {
        userId: user.id,
        canManageAllMicrosites: isGlobalDashboardViewer(session.user.email),
    };
}

async function getEditableMicrosite(id: string, access: CurrentUserAccess) {
    const microsite = await prisma.microsite.findUnique({ where: { id } });
    if (!microsite || (!access.canManageAllMicrosites && microsite.userId !== access.userId)) {
        throw new Error("Not found");
    }

    return microsite;
}

async function getEditableMicrositeLink(linkId: string, access: CurrentUserAccess) {
    const link = await prisma.micrositeLink.findUnique({
        where: { id: linkId },
        include: { microsite: true },
    });

    if (!link || (!access.canManageAllMicrosites && link.microsite.userId !== access.userId)) {
        throw new Error("Not found");
    }

    return link;
}

// ── Microsite CRUD ─────────────────────────────────────────────────────────────

export async function createMicrosite(formData: FormData) {
    const { userId } = await getCurrentUserAccess();
    const slugRaw = formData.get("slug") as string;
    const slug = await validateSlugCollision(slugRaw, undefined, true);
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const theme = normalizeMicrositeTheme(formData.get("theme"));
    const coverImage = (formData.get("coverImage") as string)?.trim() || null;
    const avatarImage = (formData.get("avatarImage") as string)?.trim() || null;

    if (!title) throw new Error("Title is required");

    const microsite = await prisma.microsite.create({
        data: { slug, title, description, theme, userId, coverImage, avatarImage },
    });

    revalidatePath("/dashboard/microsites");
    return { success: true, microsite };
}

export async function updateMicrosite(id: string, formData: FormData) {
    const access = await getCurrentUserAccess();
    const microsite = await getEditableMicrosite(id, access);

    const title = formData.has("title") ? (formData.get("title") as string)?.trim() : microsite.title;
    const description = formData.has("description") ? ((formData.get("description") as string)?.trim() || null) : microsite.description;
    const theme = formData.has("theme") ? normalizeMicrositeTheme(formData.get("theme")) : microsite.theme;
    const isPublished = formData.has("isPublished") ? (formData.get("isPublished") === "true") : microsite.isPublished;
    const coverImage = formData.has("coverImage") ? ((formData.get("coverImage") as string)?.trim() || null) : microsite.coverImage;
    const avatarImage = formData.has("avatarImage") ? ((formData.get("avatarImage") as string)?.trim() || null) : microsite.avatarImage;

    const updated = await prisma.microsite.update({
        where: { id },
        data: { title, description, theme, isPublished, coverImage, avatarImage },
    });

    revalidatePath(`/dashboard/microsites/${id}`);
    revalidatePath(`/${updated.slug}`);
    return { success: true, microsite: updated };
}

export async function deleteMicrosite(id: string) {
    const access = await getCurrentUserAccess();
    await getEditableMicrosite(id, access);

    await prisma.microsite.delete({ where: { id } });
    revalidatePath("/dashboard/microsites");
    return { success: true };
}

// ── Microsite Link CRUD ────────────────────────────────────────────────────────

export async function createMicrositeLink(micrositeId: string, formData: FormData) {
    const access = await getCurrentUserAccess();
    await getEditableMicrosite(micrositeId, access);

    const title = (formData.get("title") as string)?.trim();
    const urlRaw = (formData.get("url") as string)?.trim();
    const icon = (formData.get("icon") as string)?.trim() || null;

    if (!urlRaw) throw new Error("URL is required");
    const url = validateAndCorrectUrl(urlRaw);

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
    const access = await getCurrentUserAccess();
    const link = await getEditableMicrositeLink(linkId, access);

    const title = (formData.get("title") as string)?.trim();
    const urlRaw = (formData.get("url") as string)?.trim();
    const icon = (formData.get("icon") as string)?.trim() || null;
    const isActive = formData.get("isActive") !== "false";

    if (!urlRaw) throw new Error("URL is required");
    const url = validateAndCorrectUrl(urlRaw);

    const updated = await prisma.micrositeLink.update({
        where: { id: linkId },
        data: { title, url, icon, isActive },
    });

    revalidatePath(`/dashboard/microsites/${link.micrositeId}`);
    return { success: true, link: updated };
}

export async function deleteMicrositeLink(linkId: string) {
    const access = await getCurrentUserAccess();
    const link = await getEditableMicrositeLink(linkId, access);

    await prisma.micrositeLink.delete({ where: { id: linkId } });
    revalidatePath(`/dashboard/microsites/${link.micrositeId}`);
    return { success: true };
}

export async function reorderMicrositeLinks(micrositeId: string, orderedIds: string[]) {
    const access = await getCurrentUserAccess();
    const microsite = await getEditableMicrosite(micrositeId, access);

    // Fetch existing link IDs for this microsite
    const existingLinks = await prisma.micrositeLink.findMany({
        where: { micrositeId },
        select: { id: true },
    });
    const existingIds = new Set(existingLinks.map((l) => l.id));

    // Validate that the submitted links match exactly the existing links
    const allValid = orderedIds.length === existingLinks.length && orderedIds.every((id) => existingIds.has(id));
    if (!allValid) {
        throw new Error("Invalid link IDs submitted");
    }

    // Atomically update indices
    await prisma.$transaction(
        orderedIds.map((id, index) =>
            prisma.micrositeLink.update({ where: { id }, data: { order: index } })
        )
    );

    revalidatePath(`/dashboard/microsites/${micrositeId}`);
    revalidatePath(`/${microsite.slug}`);
    return { success: true };
}
