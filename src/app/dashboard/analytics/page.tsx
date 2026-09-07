export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Link as LinkIcon, Globe } from "lucide-react";
import { AnalyticsCharts } from "./analytics-charts";
import { parseUserAgent } from "@/lib/user-agent";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) return null;

    const userId = dbUser.id;
    const { range = "7d" } = await searchParams;

    // --- Dynamic Time-range calculation ---
    let startDate: Date | undefined = new Date();
    if (range === "24h") {
        startDate.setHours(startDate.getHours() - 24);
    } else if (range === "30d") {
        startDate.setDate(startDate.getDate() - 30);
    } else if (range === "all") {
        startDate = undefined;
    } else {
        // default 7d
        startDate.setDate(startDate.getDate() - 7);
    }

    const dateFilter = startDate ? { gte: startDate } : undefined;
    const clicksFilter = dateFilter ? { where: { createdAt: dateFilter } } : true;

    // --- Query in parallel ---
    const [
        shortLinksCount,
        micrositesCount,
        shortLinks,
        microsites,
        recentShortClicks,
        recentMicrositeClicks,
    ] = await Promise.all([
        prisma.shortLink.count({ where: { userId } }),
        prisma.microsite.count({ where: { userId } }),
        prisma.shortLink.findMany({
            where: { userId },
            include: { _count: { select: { clicks: clicksFilter } } },
        }),
        prisma.microsite.findMany({
            where: { userId },
            include: { _count: { select: { clicks: clicksFilter } } },
            orderBy: { clicks: { _count: "desc" } },
        }),
        prisma.shortLinkClick.findMany({
            where: { shortLink: { userId }, createdAt: dateFilter },
            select: { createdAt: true, userAgent: true, country: true },
        }),
        prisma.micrositeClick.findMany({
            where: { microsite: { userId }, createdAt: dateFilter },
            select: { createdAt: true, userAgent: true, country: true },
        }),
    ]);

    const totalShortClicks = shortLinks.reduce((acc: number, curr: { _count: { clicks: number } }) => acc + curr._count.clicks, 0);
    const totalMicrositeClicks = microsites.reduce((acc: number, curr: { _count: { clicks: number } }) => acc + curr._count.clicks, 0);
    const totalClicks = totalShortClicks + totalMicrositeClicks;

    const combinedClicks = [...recentShortClicks, ...recentMicrositeClicks];

    // --- Telemetry Aggregations ---
    const countryMap: Record<string, { name: string; flag: string }> = {
        ID: { name: "Indonesia", flag: "🇮🇩" },
        US: { name: "United States", flag: "🇺🇸" },
        SG: { name: "Singapore", flag: "🇸🇬" },
        MY: { name: "Malaysia", flag: "🇲🇾" },
        JP: { name: "Japan", flag: "🇯🇵" },
        AU: { name: "Australia", flag: "🇦🇺" },
        GB: { name: "United Kingdom", flag: "🇬🇧" },
        DE: { name: "Germany", flag: "🇩🇪" },
        FR: { name: "France", flag: "🇫🇷" },
        NL: { name: "Netherlands", flag: "🇳🇱" },
    };

    const countriesCount: Record<string, number> = {};
    const devicesCount: Record<string, number> = { Mobile: 0, Desktop: 0, Unknown: 0 };
    const browsersCount: Record<string, number> = {};

    const processClick = (click: { userAgent: string | null; country: string | null }) => {
        const cCode = click.country ? click.country.toUpperCase() : "UNKNOWN";
        countriesCount[cCode] = (countriesCount[cCode] || 0) + 1;

        const { device, browser } = parseUserAgent(click.userAgent);
        devicesCount[device] = (devicesCount[device] || 0) + 1;
        browsersCount[browser] = (browsersCount[browser] || 0) + 1;
    };

    recentShortClicks.forEach(processClick);
    recentMicrositeClicks.forEach(processClick);

    const topCountries = Object.entries(countriesCount)
        .map(([code, count]) => {
            const mapped = countryMap[code];
            return {
                code,
                name: mapped ? mapped.name : code === "UNKNOWN" ? "Unknown" : code,
                flag: mapped ? mapped.flag : "🏳️",
                count,
            };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const topBrowsers = Object.entries(browsersCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    type TopItem = {
        id: string;
        label: string;
        sub: string;
        clicks: number;
        type: "short" | "microsite";
    };

    // --- Top performing items (filtered) ---
    const topItems: TopItem[] = [
        ...shortLinks.map((link) => ({
            id: link.id,
            label: `/${link.shortCode}`,
            sub: link.originalUrl,
            clicks: link._count.clicks,
            type: "short" as const,
        })),
        ...microsites.map((microsite) => ({
            id: microsite.id,
            label: microsite.title,
            sub: `/${microsite.slug}`,
            clicks: microsite._count.clicks,
            type: "microsite" as const,
        })),
    ].sort((a, b) => b.clicks - a.clicks).slice(0, 8);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Analytics</h1>
                    <p className="text-muted-foreground">Pantau performa Short Links dan Microsites kamu.</p>
                </div>

                {/* Time range selector */}
                <div className="flex bg-muted/60 p-1 rounded-lg border border-border w-fit self-start md:self-auto">
                    {[
                        { label: "24 Jam", value: "24h" },
                        { label: "7 Hari", value: "7d" },
                        { label: "30 Hari", value: "30d" },
                        { label: "Semua Waktu", value: "all" },
                    ].map((item) => (
                        <a
                            key={item.value}
                            href={`/dashboard/analytics?range=${item.value}`}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                                range === item.value
                                    ? "bg-card text-foreground border border-border shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Klik</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Rentang waktu terpilih</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Microsite Views</CardTitle>
                        <Globe className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalMicrositeClicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Dari {micrositesCount} microsite</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Short Link Klik</CardTitle>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalShortClicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Dari {shortLinksCount} link</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="text-foreground">Performance Chart</CardTitle>
                        <CardDescription className="text-muted-foreground">Total klik harian dari semua link & microsite</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AnalyticsCharts rawData={combinedClicks} range={range} />
                    </CardContent>
                </Card>

                {/* Top items */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="text-foreground">Top Performing</CardTitle>
                        <CardDescription className="text-muted-foreground">Links & microsites dengan klik terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topItems.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">Belum ada data klik.</p>
                            ) : (
                                topItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${item.type === "microsite" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                                            {item.type === "microsite" ? (
                                                <Globe className="w-4 h-4 text-primary" />
                                            ) : (
                                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                                        </div>
                                        <div className="ml-auto font-semibold text-foreground tabular-nums">
                                            {item.clicks}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Telemetry Widgets Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Countries */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Negara Asal</CardTitle>
                        <CardDescription className="text-muted-foreground">Lokasi geografis pengunjung</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCountries.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">Belum ada data negara.</p>
                            ) : (
                                topCountries.map((c) => (
                                    <div key={c.code} className="flex items-center gap-3">
                                        <span className="text-2xl select-none">{c.flag}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.code}</p>
                                        </div>
                                        <div className="font-semibold text-foreground tabular-nums">
                                            {c.count} klik
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Device & Browser Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Perangkat & Browser</CardTitle>
                        <CardDescription className="text-muted-foreground">Tipe device dan browser pengunjung</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Device Types */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipe Perangkat</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background/50 p-3 rounded-lg border border-border text-center">
                                    <p className="text-xs text-muted-foreground">Mobile</p>
                                    <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
                                        {devicesCount.Mobile}
                                    </p>
                                </div>
                                <div className="bg-background/50 p-3 rounded-lg border border-border text-center">
                                    <p className="text-xs text-muted-foreground">Desktop</p>
                                    <p className="text-lg font-bold text-foreground mt-1 tabular-nums">
                                        {devicesCount.Desktop}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Browsers */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Browser Terpopuler</h4>
                            <div className="space-y-2">
                                {topBrowsers.length === 0 ? (
                                    <p className="text-muted-foreground text-sm py-1">Belum ada data browser.</p>
                                ) : (
                                    topBrowsers.map((b) => (
                                        <div key={b.name} className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">{b.name}</span>
                                            <span className="font-semibold text-foreground tabular-nums">{b.count} klik</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Short Link breakdown table */}
            {shortLinks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Short Link Breakdown</CardTitle>
                        <CardDescription className="text-muted-foreground">Detail performa setiap short link</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {shortLinks.map((link) => (
                                <div key={link.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">/{link.shortCode}</p>
                                        <p className="text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-foreground">{link._count.clicks}</p>
                                        <p className="text-xs text-muted-foreground">klik</p>
                                    </div>
                                    <div className="w-24 bg-muted rounded-full h-1.5 flex-shrink-0">
                                        <div
                                            className="bg-primary h-1.5 rounded-full"
                                            style={{
                                                width: totalShortClicks > 0
                                                    ? `${Math.round((link._count.clicks / totalShortClicks) * 100)}%`
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

            {/* Microsite breakdown table */}
            {microsites.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Microsite Breakdown</CardTitle>
                        <CardDescription className="text-muted-foreground">Detail performa setiap microsite</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {microsites.map((ms) => (
                                <div key={ms.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{ms.title}</p>
                                        <p className="text-xs text-muted-foreground">/{ms.slug}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-foreground">{ms._count.clicks}</p>
                                        <p className="text-xs text-muted-foreground">klik</p>
                                    </div>
                                    <div className="w-24 bg-muted rounded-full h-1.5 flex-shrink-0">
                                        <div
                                            className="bg-primary h-1.5 rounded-full"
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
