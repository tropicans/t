"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

// Helper: get DB user from session email (reliable across hot reloads)
async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    return prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function getShortLinks() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await prisma.shortLink.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function createShortLink(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    const originalUrl = formData.get("originalUrl") as string;
    const customAlias = formData.get("customAlias") as string;
    const rawPassword = formData.get("password") as string;

    if (!originalUrl) return { error: "Original URL is required" };

    try {
        new URL(originalUrl);
    } catch {
        return { error: "Invalid URL provided." };
    }

    try {
        let shortCode = customAlias;

        if (customAlias) {
            const existing = await prisma.shortLink.findUnique({
                where: { shortCode: customAlias },
            });
            if (existing) return { error: "Custom alias is already in use." };
        } else {
            let isUnique = false;
            while (!isUnique) {
                shortCode = nanoid(7);
                const existing = await prisma.shortLink.findUnique({ where: { shortCode } });
                if (!existing) isUnique = true;
            }
        }

        let passwordHash = null;
        if (rawPassword) {
            passwordHash = await bcrypt.hash(rawPassword, 10);
        }

        await prisma.shortLink.create({
            data: {
                userId: user.id,
                originalUrl,
                shortCode,
                password: passwordHash,
            },
        });

        revalidatePath("/dashboard/links");
        return { success: `Short link created! ID: ${shortCode}` };
    } catch (error) {
        console.error("Error creating short link:", error);
        return { error: "Failed to create short link" };
    }
}

export async function deleteShortLink(id: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.shortLink.delete({
            where: { id, userId: user.id },
        });

        revalidatePath("/dashboard/links");
        return { success: "Short link deleted" };
    } catch {
        return { error: "Failed to delete link" };
    }
}
