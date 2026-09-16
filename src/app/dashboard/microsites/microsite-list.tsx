"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getMicrositeTheme } from "@/lib/microsite-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MicrositeQrCode } from "@/components/microsite-qr-code";
import {
    Plus,
    ExternalLink,
    PlusCircle,
    Eye,
    EyeOff,
    Link2,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Layers,
    RotateCcw,
} from "lucide-react";

export interface MicrositeItem {
    id: string;
    title: string;
    slug: string;
    theme: string;
    isPublished: boolean;
    userId: string;
    createdAt: Date | string;
    _count: {
        links: number;
        clicks: number;
    };
    user: {
        name: string | null;
        email: string | null;
    };
}

interface MicrositeListProps {
    initialMicrosites: MicrositeItem[];
    viewerUserId: string;
    canViewAllMicrosites: boolean;
    pageSize?: number;
}

function ThemeThumbnail({ theme, title }: { theme: string; title: string }) {
    const initial = title.charAt(0).toUpperCase() || "M";
    const { thumbnail } = getMicrositeTheme(theme);

    return (
        <div className={`h-32 w-full rounded-xl mb-4 ${thumbnail.container}`}>
            <div className={thumbnail.avatar}>
                {initial}
            </div>
        </div>
    );
}

export function MicrositeList({
    initialMicrosites,
    viewerUserId,
    canViewAllMicrosites,
    pageSize = 9,
}: MicrositeListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    // Counts for filter pills
    const publishedCount = useMemo(
        () => initialMicrosites.filter((m) => m.isPublished).length,
        [initialMicrosites]
    );
    const draftCount = useMemo(
        () => initialMicrosites.filter((m) => !m.isPublished).length,
        [initialMicrosites]
    );

    // Filtered microsites
    const filteredMicrosites = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return initialMicrosites.filter((ms) => {
            // Status match
            if (statusFilter === "PUBLISHED" && !ms.isPublished) return false;
            if (statusFilter === "DRAFT" && ms.isPublished) return false;

            // Search query match
            if (!query) return true;

            const titleMatch = ms.title.toLowerCase().includes(query);
            const slugMatch = ms.slug.toLowerCase().includes(query);
            const ownerMatch =
                canViewAllMicrosites &&
                ((ms.user?.name?.toLowerCase().includes(query) ?? false) ||
                    (ms.user?.email?.toLowerCase().includes(query) ?? false));

            return titleMatch || slugMatch || ownerMatch;
        });
    }, [initialMicrosites, searchQuery, statusFilter, canViewAllMicrosites]);

    // Pagination calculations
    const totalItems = filteredMicrosites.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedMicrosites = useMemo(
        () => filteredMicrosites.slice(startIndex, endIndex),
        [filteredMicrosites, startIndex, endIndex]
    );

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (filter: "ALL" | "PUBLISHED" | "DRAFT") => {
        setStatusFilter(filter);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
        setCurrentPage(1);
    };

    // Full empty state when user has zero microsites overall
    if (initialMicrosites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border bg-card/40 rounded-2xl text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Layers className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground mb-2">Belum ada microsite</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                    Buat microsite pertamamu untuk mulai mengumpulkan link dalam satu halaman.
                </p>
                <Link href="/dashboard/microsites/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Buat Microsite
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Bar & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari judul, slug, atau nama..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-9 h-10 text-sm bg-card border-border rounded-xl placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            title="Hapus pencarian"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => handleStatusFilterChange("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            statusFilter === "ALL"
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
                        }`}
                    >
                        Semua ({initialMicrosites.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStatusFilterChange("PUBLISHED")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            statusFilter === "PUBLISHED"
                                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
                        }`}
                    >
                        Publik ({publishedCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStatusFilterChange("DRAFT")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            statusFilter === "DRAFT"
                                ? "bg-stone-600 text-white font-semibold shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
                        }`}
                    >
                        Draft ({draftCount})
                    </button>
                </div>
            </div>

            {/* Results Counter / Active Filter Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                <span>
                    {totalItems > 0 ? (
                        <>
                            Menampilkan <span className="font-semibold text-foreground">{startIndex + 1}</span> -{" "}
                            <span className="font-semibold text-foreground">{endIndex}</span> dari{" "}
                            <span className="font-semibold text-foreground">{totalItems}</span> microsite
                            {totalItems < initialMicrosites.length && ` (difilter dari total ${initialMicrosites.length})`}
                        </>
                    ) : (
                        "Tidak ada microsite yang sesuai"
                    )}
                </span>
                {totalPages > 1 && (
                    <span>
                        Halaman <span className="font-semibold text-foreground">{safeCurrentPage}</span> dari{" "}
                        <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>
                )}
            </div>

            {/* Empty Search Results */}
            {totalItems === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border bg-card/30 rounded-2xl text-center px-4">
                    <div className="w-12 h-12 bg-muted/60 rounded-xl flex items-center justify-center mb-3">
                        <Search className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                        Tidak ada microsite ditemukan
                    </h3>
                    <p className="text-muted-foreground text-xs max-w-sm mb-4">
                        {searchQuery
                            ? `Tidak ada microsite yang cocok dengan kata kunci "${searchQuery}".`
                            : "Tidak ada microsite dengan status yang dipilih."}
                    </p>
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-xs">
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Filter & Pencarian
                    </Button>
                </div>
            ) : (
                <>
                    {/* Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedMicrosites.map((ms) => {
                            return (
                                <div
                                    key={ms.id}
                                    className="bg-card border border-border hover:border-primary/40 rounded-xl p-5 group transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <ThemeThumbnail theme={ms.theme} title={ms.title} />

                                        {/* Title + Badge */}
                                        <div className="flex items-start justify-between mb-1 gap-2">
                                            <h3
                                                className="text-base font-semibold text-foreground truncate"
                                                title={ms.title}
                                            >
                                                {ms.title}
                                            </h3>
                                            {ms.isPublished ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                                                    <Eye className="w-2.5 h-2.5" /> Publik
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border flex items-center gap-1 shrink-0">
                                                    <EyeOff className="w-2.5 h-2.5" /> Draft
                                                </span>
                                            )}
                                        </div>

                                        {/* Slug */}
                                        <p className="text-primary text-xs font-medium mb-2 font-mono">
                                            /{ms.slug}
                                        </p>

                                        {/* Owner info for Global Viewer/Admin */}
                                        {canViewAllMicrosites && ms.userId !== viewerUserId ? (
                                            <p className="text-xs text-muted-foreground mb-3 truncate">
                                                Owner: {ms.user?.name || ms.user?.email || "Tanpa nama"}
                                            </p>
                                        ) : null}
                                    </div>

                                    {/* Stats + Actions */}
                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                                            <a
                                                href={`/${ms.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    title="Buka Microsite"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </a>
                                            <MicrositeQrCode slug={ms.slug} title={ms.title} />
                                            <Link href={`/dashboard/microsites/${ms.id}`}>
                                                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                                Halaman {safeCurrentPage} dari {totalPages}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={safeCurrentPage <= 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="gap-1 h-8 px-3 text-xs"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                                </Button>

                                <div className="flex items-center gap-1 mx-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((pageNum) => {
                                            // Always show first, last, and pages near current
                                            return (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                Math.abs(pageNum - safeCurrentPage) <= 1
                                            );
                                        })
                                        .map((pageNum, idx, array) => {
                                            const prevPage = array[idx - 1];
                                            const showEllipsisBefore = prevPage && pageNum - prevPage > 1;

                                            return (
                                                <span key={pageNum} className="flex items-center gap-1">
                                                    {showEllipsisBefore && (
                                                        <span className="text-xs text-muted-foreground px-1 select-none">
                                                            …
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant={safeCurrentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 p-0 text-xs ${
                                                            safeCurrentPage === pageNum
                                                                ? "font-bold shadow-xs"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                </span>
                                            );
                                        })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={safeCurrentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="gap-1 h-8 px-3 text-xs"
                                >
                                    Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Add more CTA at bottom */}
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-border bg-card/40 rounded-2xl">
                        <div className="text-center">
                            <PlusCircle className="w-9 h-9 text-muted-foreground/60 mx-auto mb-2.5" />
                            <p className="text-muted-foreground text-sm">
                                Butuh halaman baru?{" "}
                                <Link
                                    href="/dashboard/microsites/new"
                                    className="text-primary font-semibold hover:text-terracotta-active transition-colors"
                                >
                                    + Buat microsite lainnya
                                </Link>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
