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

    const [
        shortLinksCount,
        micrositesCount,
        shortClicksCount,
        micrositeClicksCount,
        recentMicrosites,
        recentShortLinks
    ] = dbUser
        ? await Promise.all([
            prisma.shortLink.count({ where: { userId: dbUser.id } }),
            prisma.microsite.count({ where: { userId: dbUser.id } }),
            prisma.shortLinkClick.count({ where: { shortLink: { userId: dbUser.id } } }),
            prisma.micrositeClick.count({ where: { microsite: { userId: dbUser.id } } }),
            prisma.microsite.findMany({
                where: { userId: dbUser.id },
                orderBy: { updatedAt: "desc" },
                take: 3,
                select: { id: true, slug: true, title: true, theme: true, updatedAt: true },
            }),
            prisma.shortLink.findMany({
                where: { userId: dbUser.id },
                orderBy: { createdAt: "desc" },
                take: 3,
                select: { id: true, shortCode: true, originalUrl: true, createdAt: true },
            }),
        ])
        : [0, 0, 0, 0, [], []];

    const totalClicks = shortClicksCount + micrositeClicksCount;
    const isNewAccount = shortLinksCount === 0 && micrositesCount === 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Selamat datang, {session?.user?.name?.split(" ")[0]}! 👋
                    </p>
                </div>
            </div>

            {/* Metric stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Microsites</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Globe className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{micrositesCount}</div>
                        <Link href="/dashboard/microsites" className="text-xs font-medium text-terracotta-active dark:text-primary hover:underline mt-2 inline-block">
                            Kelola microsites →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Short Links</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <LinkIcon className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{shortLinksCount}</div>
                        <Link href="/dashboard/links" className="text-xs font-medium text-terracotta-active dark:text-primary hover:underline mt-2 inline-block">
                            Kelola links →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Klik</CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
                        <Link href="/dashboard/analytics" className="text-xs font-medium text-terracotta-active dark:text-primary hover:underline mt-2 inline-block">
                            Lihat analytics →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3">
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

            {/* Onboarding Guidance for New Accounts */}
            {isNewAccount ? (
                <Card className="border-border bg-card p-6 md:p-8 rounded-2xl relative overflow-hidden">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary mb-3">
                            ✨ Mulai Sekarang
                        </span>
                        <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">
                            Buat Tautan & Microsite Pertama Anda
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                            Kelola identitas online Anda di satu tempat. Buat halaman link-in-bio personal dengan tema editorial yang elegan, atau perpendek tautan panjang Anda dengan analitik klik real-time.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-6">
                            <Link href="/dashboard/microsites/new">
                                <Button className="bg-primary text-primary-foreground hover:bg-terracotta-active shadow-xs">
                                    + Buat Microsite Baru
                                </Button>
                            </Link>
                            <Link href="/dashboard/links">
                                <Button variant="outline" className="border-border hover:bg-muted text-foreground">
                                    + Perpendek Link Pertama
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            ) : (
                /* Recent Activity Section */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Recent Microsites */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-serif font-bold text-foreground">Microsite Terkini</CardTitle>
                                <p className="text-xs text-muted-foreground">Halaman link-in-bio yang terakhir diperbarui</p>
                            </div>
                            <Link href="/dashboard/microsites" className="text-xs font-medium text-terracotta-active dark:text-primary hover:underline">
                                Lihat semua →
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentMicrosites.length === 0 ? (
                                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                                    Belum ada microsite. <Link href="/dashboard/microsites/new" className="text-primary hover:underline font-medium">Buat sekarang</Link>
                                </div>
                            ) : (
                                recentMicrosites.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border hover:border-primary/40 transition-colors">
                                        <div className="min-w-0 pr-3">
                                            <p className="text-sm font-medium text-foreground truncate">{m.title || m.slug}</p>
                                            <p className="text-xs text-muted-foreground truncate">/{m.slug}</p>
                                        </div>
                                        <Link href={`/dashboard/microsites/${m.id}`}>
                                            <Button size="sm" variant="outline" className="text-xs h-8 border-border hover:bg-muted">
                                                Editor
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Short Links */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-serif font-bold text-foreground">Short Link Terkini</CardTitle>
                                <p className="text-xs text-muted-foreground">Tautan pendek yang baru dibuat</p>
                            </div>
                            <Link href="/dashboard/links" className="text-xs font-medium text-terracotta-active dark:text-primary hover:underline">
                                Lihat semua →
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentShortLinks.length === 0 ? (
                                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                                    Belum ada short link. <Link href="/dashboard/links" className="text-primary hover:underline font-medium">Buat sekarang</Link>
                                </div>
                            ) : (
                                recentShortLinks.map((link) => (
                                    <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border hover:border-primary/40 transition-colors">
                                        <div className="min-w-0 pr-3">
                                            <p className="text-sm font-medium text-foreground truncate">/{link.shortCode}</p>
                                            <p className="text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                                        </div>
                                        <Link href="/dashboard/links">
                                            <Button size="sm" variant="outline" className="text-xs h-8 border-border hover:bg-muted">
                                                Kelola
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
