export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LinkIcon, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    const dbUser = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;

    const [shortLinksCount, micrositesCount, shortClicksCount, micrositeClicksCount] = dbUser
        ? await Promise.all([
            prisma.shortLink.count({ where: { userId: dbUser.id } }),
            prisma.microsite.count({ where: { userId: dbUser.id } }),
            prisma.shortLinkClick.count({ where: { shortLink: { userId: dbUser.id } } }),
            prisma.micrositeClick.count({ where: { microsite: { userId: dbUser.id } } }),
        ])
        : [0, 0, 0, 0];

    const totalClicks = shortClicksCount + micrositeClicksCount;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Selamat datang, {session?.user?.name?.split(" ")[0]}! 👋
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Microsites</CardTitle>
                        <Globe className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{micrositesCount}</div>
                        <Link href="/dashboard/microsites" className="text-xs text-primary hover:text-terracotta-active mt-1 inline-block">
                            Kelola microsites →
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Short Links</CardTitle>
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{shortLinksCount}</div>
                        <Link href="/dashboard/links" className="text-xs text-muted-foreground hover:text-foreground mt-1 inline-block">
                            Kelola links →
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Klik</CardTitle>
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
                        <Link href="/dashboard/analytics" className="text-xs text-muted-foreground hover:text-foreground mt-1 inline-block">
                            Lihat analytics →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 pt-2">
                <Link href="/dashboard/microsites/new">
                    <Button>
                        + Buat Microsite
                    </Button>
                </Link>
                <Link href="/dashboard/links">
                    <Button variant="outline">
                        + Short Link
                    </Button>
                </Link>
            </div>
        </div>
    );
}
