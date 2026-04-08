export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { MicrositeEditor } from "./microsite-editor";
import { isGlobalMicrositeViewer } from "@/lib/microsite-access";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditMicrositePage({ params }: Props) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const canManageAllMicrosites = isGlobalMicrositeViewer(session.user.email);

    // Use email-based lookup for reliability (id may not be in token if DB query failed)
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) redirect("/login");

    const { id } = await params;

    const microsite = await prisma.microsite.findUnique({
        where: { id },
        include: {
            links: { orderBy: { order: "asc" } },
            _count: { select: { clicks: true } },
            user: { select: { name: true, email: true } },
        },
    });

    if (!microsite || (!canManageAllMicrosites && microsite.userId !== dbUser.id)) notFound();

    return <MicrositeEditor microsite={microsite} />;
}
