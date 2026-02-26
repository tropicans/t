export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Link as LinkIcon, Globe } from "lucide-react";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) return null;

    const userId = dbUser.id;

    // --- Summary counts ---
    const [shortLinksCount, micrositesCount] = await Promise.all([
        prisma.shortLink.count({ where: { userId } }),
        prisma.microsite.count({ where: { userId } }),
    ]);

    // --- Per-link click counts ---
    const [shortLinks, microsites] = await Promise.all([
        prisma.shortLink.findMany({
            where: { userId },
            include: { _count: { select: { clicks: true } } },
        }),
        prisma.microsite.findMany({
            where: { userId },
            include: { _count: { select: { clicks: true } } },
            orderBy: { clicks: { _count: "desc" } },
        }),
    ]);

    const totalShortClicks = shortLinks.reduce((acc: number, curr: { _count: { clicks: number } }) => acc + curr._count.clicks, 0);
    const totalMicrositeClicks = microsites.reduce((acc: number, curr: { _count: { clicks: number } }) => acc + curr._count.clicks, 0);
    const totalClicks = totalShortClicks + totalMicrositeClicks;

    // --- Time-series (last 7 days) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentShortClicks, recentMicrositeClicks] = await Promise.all([
        prisma.shortLinkClick.findMany({
            where: { shortLink: { userId }, createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true },
        }),
        prisma.micrositeClick.findMany({
            where: { microsite: { userId }, createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true },
        }),
    ]);

    const combinedClicks = [...recentShortClicks, ...recentMicrositeClicks];

    // --- Top performing items ---
    const topItems = [
        ...shortLinks.map((l: any) => ({ id: l.id, label: `/${l.shortCode}`, sub: l.originalUrl, clicks: l._count.clicks, type: "short" })),
        ...microsites.map((m: any) => ({ id: m.id, label: m.title, sub: `/${m.slug}`, clicks: m._count.clicks, type: "microsite" })),
    ].sort((a, b) => b.clicks - a.clicks).slice(0, 8);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
                <p className="text-zinc-400">Pantau performa Short Links dan Microsites kamu.</p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Klik</CardTitle>
                        <Activity className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Semua link & microsite</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Microsite Views</CardTitle>
                        <Globe className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalMicrositeClicks.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Dari {micrositesCount} microsite</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Short Link Klik</CardTitle>
                        <LinkIcon className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalShortClicks.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">Dari {shortLinksCount} link</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart */}
                <Card className="col-span-4 bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">7-Day Performance</CardTitle>
                        <CardDescription className="text-zinc-400">Total klik harian dari semua link & microsite</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AnalyticsCharts rawData={combinedClicks} />
                    </CardContent>
                </Card>

                {/* Top items */}
                <Card className="col-span-3 bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Top Performing</CardTitle>
                        <CardDescription className="text-zinc-400">Links & microsites dengan klik terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topItems.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-4">Belum ada data klik.</p>
                            ) : (
                                topItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${item.type === "microsite" ? "bg-blue-500/20" : "bg-zinc-800"}`}>
                                            {item.type === "microsite" ? (
                                                <Globe className="w-4 h-4 text-blue-400" />
                                            ) : (
                                                <LinkIcon className="w-4 h-4 text-zinc-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{item.label}</p>
                                            <p className="text-xs text-zinc-500 truncate">{item.sub}</p>
                                        </div>
                                        <div className="ml-auto font-semibold text-white tabular-nums">
                                            {item.clicks}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Microsite breakdown table */}
            {microsites.length > 0 && (
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Microsite Breakdown</CardTitle>
                        <CardDescription className="text-zinc-400">Detail performa setiap microsite</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {microsites.map((ms: any) => (
                                <div key={ms.id} className="flex items-center gap-4 py-2 border-b border-zinc-800 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white">{ms.title}</p>
                                        <p className="text-xs text-zinc-500">/{ms.slug}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-white">{ms._count.clicks}</p>
                                        <p className="text-xs text-zinc-500">klik</p>
                                    </div>
                                    <div className="w-24 bg-zinc-800 rounded-full h-1.5">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{
                                                width: totalMicrositeClicks > 0
                                                    ? `${Math.round((ms._count.clicks / totalMicrositeClicks) * 100)}%`
                                                    : "0%"
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
