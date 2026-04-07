import { prisma } from "@/lib/prisma";

export interface PublicMicrositeData {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    theme: string;
    coverImage: string | null;
    avatarImage: string | null;
    links: Array<{
        id: string;
        title: string;
    }>;
    user: {
        name: string | null;
        image: string | null;
    };
}

export async function getPublishedMicrosite(slug: string): Promise<PublicMicrositeData | null> {
    return prisma.microsite.findFirst({
        where: { slug, isPublished: true },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            theme: true,
            coverImage: true,
            avatarImage: true,
            links: {
                where: { isActive: true },
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    title: true,
                },
            },
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });
}
