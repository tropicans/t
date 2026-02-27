export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { PasswordForm } from "@/components/short-link/password-form";
import { trackShortLinkClick } from "@/app/actions/short-link-redirect";
import { ShareBar } from "@/components/share-bar";

interface Props {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ error?: string }>;
}

export default async function SlugPage({ params, searchParams }: Props) {
    const { username: slug } = await params;
    const { error } = await searchParams;

    // ── 1. Short Link (highest priority) ────────────────────────────────────────
    const shortLink = await prisma.shortLink.findUnique({
        where: { shortCode: slug },
    });

    if (shortLink) {
        // Check expiration
        if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
                        <p className="text-zinc-400">This shortened link is no longer active.</p>
                    </div>
                </div>
            );
        }

        // Password protected
        if (shortLink.password) {
            return <PasswordForm shortCode={slug} error={error} />;
        }

        // Track & redirect
        await trackShortLinkClick(shortLink);
        redirect(shortLink.originalUrl);
    }

    // ── 2. Microsite ─────────────────────────────────────────────────────────────
    const microsite = await prisma.microsite.findUnique({
        where: { slug, isPublished: true },
        include: {
            links: {
                where: { isActive: true },
                orderBy: { order: "asc" },
            },
            user: { select: { name: true, image: true } },
        },
    });

    if (microsite) {
        // Track page view — read headers within request context, then fire & forget DB write
        const h = await headers();
        const userAgent = h.get("user-agent") || "unknown";
        const country = h.get("x-vercel-ip-country") || "unknown";
        prisma.micrositeClick.create({
            data: { micrositeId: microsite.id, userAgent, country },
        }).catch(() => { });

        // ── Theme color tokens ──────────────────────────────────────────────────
        const theme = microsite.theme;

        const styles = {
            dark: {
                page: "bg-zinc-950",
                hero: "from-zinc-900/0 via-zinc-950/60 to-zinc-950",
                title: "text-white",
                description: "text-zinc-400",
                avatar: "border-zinc-800 ring-2 ring-zinc-700",
                card: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30",
                cardTitle: "text-white",
                icon: "text-zinc-600 group-hover:text-zinc-300",
                empty: "text-zinc-600",
                footer: "text-zinc-800",
                footerBrand: "text-zinc-600",
                divider: "bg-zinc-800",
                share: "text-zinc-500 hover:text-white",
                shareLabel: "text-zinc-600",
            },
            light: {
                page: "bg-gray-50",
                hero: "from-gray-50/0 via-gray-50/60 to-gray-50",
                title: "text-zinc-900",
                description: "text-zinc-500",
                avatar: "border-white ring-2 ring-zinc-200",
                card: "bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60",
                cardTitle: "text-zinc-900",
                icon: "text-zinc-400 group-hover:text-zinc-600",
                empty: "text-zinc-400",
                footer: "text-zinc-300",
                footerBrand: "text-zinc-400",
                divider: "bg-zinc-200",
                share: "text-zinc-400 hover:text-zinc-800",
                shareLabel: "text-zinc-400",
            },
            gradient: {
                page: "bg-gradient-to-br from-blue-950 via-purple-950 to-zinc-950",
                hero: "from-blue-950/0 via-purple-950/60 to-zinc-950",
                title: "text-white",
                description: "text-blue-200/80",
                avatar: "border-white/10 ring-2 ring-white/20",
                card: "bg-white/10 border border-white/15 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-md hover:shadow-lg hover:shadow-black/20",
                cardTitle: "text-white",
                icon: "text-white/40 group-hover:text-white/80",
                empty: "text-white/30",
                footer: "text-white/20",
                footerBrand: "text-white/40",
                divider: "bg-white/10",
                share: "text-white/40 hover:text-white",
                shareLabel: "text-white/30",
            },
        }[theme] ?? {
            page: "bg-zinc-950",
            hero: "from-zinc-900/0 via-zinc-950/60 to-zinc-950",
            title: "text-white",
            description: "text-zinc-400",
            avatar: "border-zinc-800 ring-2 ring-zinc-700",
            card: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-600",
            cardTitle: "text-white",
            icon: "text-zinc-600 group-hover:text-zinc-300",
            empty: "text-zinc-600",
            footer: "text-zinc-800",
            footerBrand: "text-zinc-600",
            divider: "bg-zinc-800",
            share: "text-zinc-500 hover:text-white",
            shareLabel: "text-zinc-600",
        };

        const hasCover = !!microsite.coverImage;

        return (
            <div className={`min-h-screen ${styles.page}`}>

                {/* ── Cover hero ──────────────────────────────────────────── */}
                {hasCover ? (
                    <div className="relative w-full h-52 sm:h-64">
                        <img
                            src={microsite.coverImage!}
                            alt={microsite.title}
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-b ${styles.hero}`} />
                    </div>
                ) : (
                    <div className="h-16" />
                )}

                {/* ── Content ─────────────────────────────────────────────── */}
                <div className="flex flex-col items-center px-4 pb-20 -mt-12 relative">
                    <div className="w-full max-w-md">

                        {/* Profile */}
                        <div className="text-center mb-8">
                            {microsite.avatarImage ? (
                                <img
                                    src={microsite.avatarImage}
                                    alt={microsite.title}
                                    className={`w-20 h-20 rounded-full mx-auto mb-4 border-4 object-cover shadow-xl ${styles.avatar}`}
                                />
                            ) : microsite.user.image ? (
                                <img
                                    src={microsite.user.image}
                                    alt={microsite.user.name || ""}
                                    className={`w-20 h-20 rounded-full mx-auto mb-4 border-4 object-cover shadow-xl ${styles.avatar}`}
                                />
                            ) : (
                                <div className={`w-20 h-20 rounded-full mx-auto mb-4 border-4 flex items-center justify-center text-2xl font-bold shadow-xl ${styles.avatar} ${styles.page}`}>
                                    <span className={styles.title}>{microsite.title.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <h1 className={`text-2xl font-bold tracking-tight ${styles.title}`}>
                                {microsite.title}
                            </h1>
                            {microsite.description && (
                                <p className={`text-sm mt-2 leading-relaxed max-w-xs mx-auto ${styles.description}`}>
                                    {microsite.description}
                                </p>
                            )}

                            {/* Subtle divider */}
                            <div className={`w-12 h-px mx-auto mt-6 ${styles.divider}`} />
                        </div>

                        {/* Links */}
                        <div className="space-y-3">
                            {microsite.links.length === 0 ? (
                                <p className={`text-center text-sm py-8 ${styles.empty}`}>
                                    Belum ada link di microsite ini.
                                </p>
                            ) : (
                                microsite.links.map((link, i) => (
                                    <a
                                        key={link.id}
                                        href={`/api/click/microsite-link/${link.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group animate-in fade-in slide-in-from-bottom-4 ${styles.card}`}
                                        style={{ animationDelay: `${(i + 1) * 70}ms`, animationFillMode: "both" }}
                                    >
                                        <span className={`font-medium text-[15px] ${styles.cardTitle}`}>{link.title}</span>
                                        <ExternalLink className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${styles.icon}`} />
                                    </a>
                                ))
                            )}
                        </div>

                        {/* Share Buttons */}
                        <ShareBar
                            title={microsite.title}
                            slug={microsite.slug}
                            shareClass={styles.share}
                            labelClass={styles.shareLabel}
                            dividerClass={styles.divider}
                        />

                        {/* Footer */}
                        <p className={`text-center text-[11px] mt-12 tracking-wide uppercase ${styles.footer}`}>
                            Powered by <span className={`font-semibold ${styles.footerBrand}`}>Taut</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── 3. Not found ─────────────────────────────────────────────────────────────
    notFound();
}


