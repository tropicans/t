export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Plus,
    ExternalLink,
    PlusCircle,
    Eye,
    EyeOff,
    Link2,
    CalendarCheck,
    ShoppingBag,
    FileEdit,
    Sparkles,
    Globe,
    Layers,
} from "lucide-react";

// Pick a thumbnail icon based on the microsite's theme
function ThemeThumbnail({ theme, title }: { theme: string; title: string }) {
    const initial = title.charAt(0).toUpperCase();

    if (theme === "gradient") {
        return (
            <div className="h-32 w-full rounded-xl mb-4 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-blue-900/20 flex items-center justify-center overflow-hidden group-hover:from-blue-500/30 transition-all">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-14 h-14 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {initial}
                </div>
            </div>
        );
    }

    if (theme === "light") {
        return (
            <div className="h-32 w-full rounded-xl mb-4 bg-slate-100 dark:bg-zinc-800/40 flex items-center justify-center overflow-hidden group-hover:bg-zinc-800/60 transition-all">
                <div className="bg-white dark:bg-zinc-700 rounded-2xl w-14 h-14 flex items-center justify-center text-zinc-800 dark:text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                    {initial}
                </div>
            </div>
        );
    }

    // dark (default)
    return (
        <div className="h-32 w-full rounded-xl mb-4 bg-zinc-800/50 flex items-center justify-center overflow-hidden group-hover:bg-zinc-800/80 transition-all">
            <div className="bg-zinc-800 rounded-2xl w-14 h-14 flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                {initial}
            </div>
        </div>
    );
}

export default async function MicrositesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) redirect("/login");

    const microsites = await prisma.microsite.findMany({
        where: { userId: dbUser.id },
        include: {
            _count: { select: { links: true, clicks: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Microsites</h1>
                    <p className="text-zinc-400 mt-1 text-sm">
                        Kelola dan pantau halaman microsite campaign kamu
                    </p>
                </div>
                <Link href="/dashboard/microsites/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/20 font-semibold">
                        <Plus className="w-4 h-4" />
                        Buat Microsite
                    </Button>
                </Link>
            </div>

            {microsites.length === 0 ? (
                /* Full empty state */
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                        <Layers className="w-7 h-7 text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Belum ada microsite</h3>
                    <p className="text-zinc-500 text-sm mb-6 max-w-xs">
                        Buat microsite pertamamu untuk mulai mengumpulkan link dalam satu halaman.
                    </p>
                    <Link href="/dashboard/microsites/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> Buat Microsite
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {microsites.map((ms) => (
                            <div
                                key={ms.id}
                                className="bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 rounded-xl p-5 group transition-all cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <ThemeThumbnail theme={ms.theme} title={ms.title} />

                                {/* Title + Badge */}
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="text-base font-bold text-white truncate max-w-[70%]">{ms.title}</h3>
                                    {ms.isPublished ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                            <Eye className="w-2.5 h-2.5" /> Publik
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-700/50 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                                            <EyeOff className="w-2.5 h-2.5" /> Draft
                                        </span>
                                    )}
                                </div>

                                {/* Slug */}
                                <p className="text-blue-500 text-xs font-medium mb-3">/{ms.slug}</p>

                                {/* Stats + Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Link2 className="w-3.5 h-3.5" />
                                            {ms._count.links} links
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" />
                                            {ms._count.clicks} klik
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a href={`/${ms.slug}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" className="w-7 h-7 text-zinc-500 hover:text-white hover:bg-zinc-800">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                        </a>
                                        <Link href={`/dashboard/microsites/${ms.id}`}>
                                            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500">
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add more CTA at bottom */}
                    <div className="flex items-center justify-center p-10 border-2 border-dashed border-zinc-800 rounded-2xl">
                        <div className="text-center">
                            <PlusCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 text-sm">
                                Butuh halaman baru?{" "}
                                <Link href="/dashboard/microsites/new" className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                                    Buat microsite baru
                                </Link>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
