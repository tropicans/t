export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isGlobalMicrositeViewer } from "@/lib/microsite-access";
import { Plus } from "lucide-react";
import { MicrositeList } from "./microsite-list";

export default async function MicrositesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) redirect("/login");

    const canViewAllMicrosites = isGlobalMicrositeViewer(session.user.email);

    const microsites = await prisma.microsite.findMany({
        where: canViewAllMicrosites ? undefined : { userId: dbUser.id },
        include: {
            _count: { select: { links: true, clicks: true } },
            user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Microsites</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Kelola dan pantau halaman microsite campaign kamu
                    </p>
                </div>
                <Link href="/dashboard/microsites/new">
                    <Button className="gap-2 font-semibold">
                        <Plus className="w-4 h-4" />
                        Buat Microsite
                    </Button>
                </Link>
            </div>

            <MicrositeList
                initialMicrosites={microsites}
                viewerUserId={dbUser.id}
                canViewAllMicrosites={canViewAllMicrosites}
            />
        </div>
    );
}
