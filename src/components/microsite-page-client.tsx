"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ShareBar } from "@/components/share-bar";
import type { PublicMicrositeData } from "@/lib/public-microsite";

const POLL_INTERVAL_MS = 10000;

const themeStyles = {
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
} as const;

function hasMicrositeChanged(current: PublicMicrositeData, next: PublicMicrositeData) {
    if (
        current.title !== next.title ||
        current.description !== next.description ||
        current.theme !== next.theme ||
        current.coverImage !== next.coverImage ||
        current.avatarImage !== next.avatarImage ||
        current.user.name !== next.user.name ||
        current.user.image !== next.user.image ||
        current.links.length !== next.links.length
    ) {
        return true;
    }

    return current.links.some((link, index) => {
        const nextLink = next.links[index];
        return link.id !== nextLink.id || link.title !== nextLink.title;
    });
}

interface MicrositePageClientProps {
    initialMicrosite: PublicMicrositeData;
    pageUrl: string;
}

export function MicrositePageClient({ initialMicrosite, pageUrl }: MicrositePageClientProps) {
    const [microsite, setMicrosite] = useState(initialMicrosite);
    const [, startTransition] = useTransition();
    const requestInFlightRef = useRef(false);

    useEffect(() => {
        let disposed = false;
        let timeoutId: number | undefined;

        const syncMicrosite = async () => {
            if (disposed || document.visibilityState === "hidden" || requestInFlightRef.current) {
                return;
            }

            requestInFlightRef.current = true;

            try {
                const response = await fetch(
                    `/api/microsites/${encodeURIComponent(initialMicrosite.slug)}?ts=${Date.now()}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const nextMicrosite = (await response.json()) as PublicMicrositeData;

                startTransition(() => {
                    setMicrosite((currentMicrosite) =>
                        hasMicrositeChanged(currentMicrosite, nextMicrosite) ? nextMicrosite : currentMicrosite
                    );
                });
            } catch {
                // Ignore transient polling failures and try again on the next cycle.
            } finally {
                requestInFlightRef.current = false;
            }
        };

        const scheduleNextPoll = () => {
            timeoutId = window.setTimeout(async () => {
                await syncMicrosite();

                if (!disposed) {
                    scheduleNextPoll();
                }
            }, POLL_INTERVAL_MS);
        };

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                void syncMicrosite();
            }
        };

        void syncMicrosite();
        scheduleNextPoll();

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleVisibility);

        return () => {
            disposed = true;

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }

            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleVisibility);
        };
    }, [initialMicrosite.slug, startTransition]);

    const styles = themeStyles[microsite.theme as keyof typeof themeStyles] ?? themeStyles.dark;
    const hasCover = !!microsite.coverImage;

    return (
        <div className={`min-h-screen ${styles.page}`}>
            {hasCover ? (
                <div className="relative w-full h-52 sm:h-64">
                    <Image
                        src={microsite.coverImage!}
                        alt={microsite.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b ${styles.hero}`} />
                </div>
            ) : (
                <div className="h-16" />
            )}

            <div className="flex flex-col items-center px-4 pb-20 -mt-12 relative">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        {microsite.avatarImage ? (
                            <Image
                                src={microsite.avatarImage}
                                alt={microsite.title}
                                width={80}
                                height={80}
                                className={`w-20 h-20 rounded-full mx-auto mb-4 border-4 object-cover shadow-xl ${styles.avatar}`}
                            />
                        ) : microsite.user.image ? (
                            <Image
                                src={microsite.user.image}
                                alt={microsite.user.name || microsite.title}
                                width={80}
                                height={80}
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

                        <div className={`w-12 h-px mx-auto mt-6 ${styles.divider}`} />
                    </div>

                    <div className="space-y-3">
                        {microsite.links.length === 0 ? (
                            <p className={`text-center text-sm py-8 ${styles.empty}`}>
                                Belum ada link di microsite ini.
                            </p>
                        ) : (
                            microsite.links.map((link, index) => (
                                <a
                                    key={link.id}
                                    href={`/api/click/microsite-link/${link.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group animate-in fade-in slide-in-from-bottom-4 ${styles.card}`}
                                    style={{ animationDelay: `${(index + 1) * 70}ms`, animationFillMode: "both" }}
                                >
                                    <span className={`font-medium text-[15px] ${styles.cardTitle}`}>{link.title}</span>
                                    <ExternalLink className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${styles.icon}`} />
                                </a>
                            ))
                        )}
                    </div>

                    <ShareBar
                        title={microsite.title}
                        pageUrl={pageUrl}
                        shareClass={styles.share}
                        labelClass={styles.shareLabel}
                        dividerClass={styles.divider}
                    />

                    <p className={`text-center text-[11px] mt-12 tracking-wide uppercase ${styles.footer}`}>
                        Powered by <span className={`font-semibold ${styles.footerBrand}`}>Taut</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
