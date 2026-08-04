"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    updateMicrosite,
    deleteMicrosite,
    createMicrositeLink,
    updateMicrositeLink,
    deleteMicrositeLink,
    reorderMicrositeLinks,
} from "@/app/actions/microsite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Plus,
    ExternalLink,
    Trash2,
    Pencil,
    Loader2,
    Eye,
    EyeOff,
    Globe,
    GripVertical,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import { CoverImageUploader } from "@/components/cover-image-uploader";
import { AvatarImageUploader } from "@/components/avatar-image-uploader";
import Link from "next/link";
import { MICROSITE_THEMES, normalizeMicrositeTheme } from "@/lib/microsite-themes";
import { MicrositeQrCode } from "@/components/microsite-qr-code";

type MicrositeLink = {
    id: string;
    title: string;
    url: string;
    icon: string | null;
    order: number;
    isActive: boolean;
    micrositeId: string;
    createdAt: Date;
    updatedAt: Date;
};

type Microsite = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    theme: string;
    coverImage: string | null;
    avatarImage: string | null;
    isPublished: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

type MicrositeWithLinks = Microsite & {
    links: MicrositeLink[];
    _count: { clicks: number };
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Terjadi kesalahan tak terduga";
}

export function MicrositeEditor({ microsite }: { microsite: MicrositeWithLinks }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editLinkId, setEditLinkId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState(normalizeMicrositeTheme(microsite.theme));
    const [coverImageUrl, setCoverImageUrl] = useState(microsite.coverImage || "");
    const [avatarImageUrl, setAvatarImageUrl] = useState(microsite.avatarImage || "");

    const [slugValue, setSlugValue] = useState(microsite.slug);
    const [domainPrefix, setDomainPrefix] = useState("/");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setDomainPrefix(`${window.location.host}/`);
        }
    }, []);

    // Sync slugValue when props update
    useEffect(() => {
        setSlugValue(microsite.slug);
    }, [microsite.slug]);

    const cleanClientSlug = (val: string) => {
        return val
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugValue(cleanClientSlug(e.target.value));
    };

    const handleSlugBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setSlugValue((prev) => prev.replace(/^-|-$/g, ""));
    };

    // --- Links ordering state ---
    const [linksState, setLinksState] = useState(microsite.links);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragPosition, setDragPosition] = useState<"top" | "bottom" | null>(null);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [focusTarget, setFocusTarget] = useState<{ id: string; direction: "up" | "down" } | null>(null);

    // Sync linksState when props update
    useEffect(() => {
        setLinksState(microsite.links);
    }, [microsite.links]);

    // Focus restoration effect
    useEffect(() => {
        if (focusTarget) {
            const el = document.getElementById(`btn-${focusTarget.direction}-${focusTarget.id}`);
            if (el && !el.hasAttribute("disabled")) {
                el.focus();
            }
            setFocusTarget(null);
        }
    }, [linksState, focusTarget]);

    const isReorderDisabled = isPending || editLinkId !== null || showAddForm;

    function handleReorder(newLinks: MicrositeLink[], movedLinkTitle?: string, targetIndex?: number) {
        const originalLinks = [...linksState];
        setLinksState(newLinks);
        setError(null);

        const currentOrderIds = microsite.links.map((l) => l.id);
        const newOrderIds = newLinks.map((l) => l.id);
        if (JSON.stringify(currentOrderIds) === JSON.stringify(newOrderIds)) {
            return;
        }

        setAnnouncement("Mengurutkan...");
        setShowSaveSuccess(false);

        startTransition(async () => {
            try {
                const res = await reorderMicrositeLinks(microsite.id, newOrderIds);
                if (!res.success) throw new Error("Gagal mengurutkan link");
                setShowSaveSuccess(true);
                setTimeout(() => setShowSaveSuccess(false), 1500);
                if (movedLinkTitle && targetIndex !== undefined) {
                    setAnnouncement(
                        `Tautan "${movedLinkTitle}" berhasil dipindahkan ke posisi ${targetIndex + 1} dari ${newLinks.length}`
                    );
                }
                router.refresh();
            } catch (err) {
                setLinksState(originalLinks);
                setError(getErrorMessage(err));
                setAnnouncement("Gagal mengurutkan link");
                setTimeout(() => setError(null), 5000);
            }
        });
    }

    // HTML5 Drag Handlers
    function handleDragStart(e: React.DragEvent, index: number) {
        if (isReorderDisabled) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        setDraggingIndex(index);
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const position = relativeY < rect.height / 2 ? "top" : "bottom";
        setDragOverIndex(index);
        setDragPosition(position);
    }

    function handleDragLeave() {
        setDragOverIndex(null);
        setDragPosition(null);
    }

    function handleDrop(e: React.DragEvent, targetIndex: number) {
        e.preventDefault();
        if (draggingIndex === null) return;
        
        const pos = dragPosition;
        setDraggingIndex(null);
        setDragOverIndex(null);
        setDragPosition(null);

        if (draggingIndex === targetIndex) return;

        let targetIdx = targetIndex;
        if (draggingIndex < targetIndex && pos === "top") {
            targetIdx = targetIndex - 1;
        } else if (draggingIndex > targetIndex && pos === "bottom") {
            targetIdx = targetIndex + 1;
        }

        if (draggingIndex === targetIdx) return;

        const reordered = [...linksState];
        const [draggedItem] = reordered.splice(draggingIndex, 1);
        reordered.splice(targetIdx, 0, draggedItem);

        handleReorder(reordered, draggedItem.title, targetIdx);
    }

    // Chevron handlers
    function handleMoveUp(index: number) {
        if (index === 0 || isReorderDisabled) return;
        const reordered = [...linksState];
        const movedLink = reordered[index];
        const temp = reordered[index];
        reordered[index] = reordered[index - 1];
        reordered[index - 1] = temp;
        
        // Focus boundary tracking
        const newIndex = index - 1;
        setFocusTarget({
            id: movedLink.id,
            direction: newIndex === 0 ? "down" : "up",
        });
        
        handleReorder(reordered, movedLink.title, newIndex);
    }

    // Chevron handlers
    function handleMoveDown(index: number) {
        if (index === linksState.length - 1 || isReorderDisabled) return;
        const reordered = [...linksState];
        const movedLink = reordered[index];
        const temp = reordered[index];
        reordered[index] = reordered[index + 1];
        reordered[index + 1] = temp;
        
        // Focus boundary tracking
        const newIndex = index + 1;
        setFocusTarget({
            id: movedLink.id,
            direction: newIndex === reordered.length - 1 ? "up" : "down",
        });

        handleReorder(reordered, movedLink.title, newIndex);
    }

    // --- Update microsite info ---
    function handleUpdateInfo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await updateMicrosite(microsite.id, formData);
                router.refresh();
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }

    // --- Toggle published ---
    function handleTogglePublished() {
        startTransition(async () => {
            const fd = new FormData();
            fd.set("title", microsite.title);
            fd.set("isPublished", String(!microsite.isPublished));
            await updateMicrosite(microsite.id, fd);
            router.refresh();
        });
    }

    // --- Delete microsite ---
    function handleDelete() {
        if (!confirm(`Hapus microsite "${microsite.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        startTransition(async () => {
            await deleteMicrosite(microsite.id);
            router.push("/dashboard/microsites");
        });
    }

    // --- Add link ---
    function handleAddLink(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await createMicrositeLink(microsite.id, formData);
                (e.target as HTMLFormElement).reset();
                setShowAddForm(false);
                router.refresh();
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }

    // --- Edit link ---
    function handleEditLink(e: React.FormEvent<HTMLFormElement>, linkId: string) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await updateMicrositeLink(linkId, formData);
                setEditLinkId(null);
                router.refresh();
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }

    // --- Delete link ---
    function handleDeleteLink(linkId: string) {
        if (!confirm("Hapus link ini?")) return;
        startTransition(async () => {
            await deleteMicrositeLink(linkId);
            router.refresh();
        });
    }

    // --- Toggle link visibility ---
    function handleToggleLinkVisibility(link: MicrositeLink) {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.set("title", link.title);
                formData.set("url", link.url);
                formData.set("isActive", String(!link.isActive));
                formData.set("icon", link.icon || "");
                await updateMicrositeLink(link.id, formData);
                router.refresh();
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/microsites">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">{microsite.title}</h1>
                        {microsite.isPublished ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Publik</Badge>
                        ) : (
                            <Badge className="bg-zinc-800 text-zinc-500 text-xs">Draft</Badge>
                        )}
                    </div>
                    <p className="text-zinc-500 text-sm">/{microsite.slug} · {microsite._count.clicks} klik</p>
                </div>
                <a href={`/${microsite.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white gap-2">
                        <Globe className="w-3.5 h-3.5" /> Lihat
                    </Button>
                </a>
                <MicrositeQrCode slug={microsite.slug} title={microsite.title} variant="button" />
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
            )}

            {/* Info Form */}
            <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-base">Informasi Microsite</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateInfo} className="space-y-4">
                        <input type="hidden" name="isPublished" value={String(microsite.isPublished)} />

                        {/* Avatar Image */}
                        <input type="hidden" name="avatarImage" value={avatarImageUrl} />
                        <AvatarImageUploader
                            currentUrl={avatarImageUrl}
                            onUploadComplete={(url) => setAvatarImageUrl(url)}
                            fallbackInitial={microsite.title.charAt(0).toUpperCase()}
                        />
                        <div className="w-full h-px bg-zinc-800 my-4" />

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Judul</Label>
                            <Input name="title" defaultValue={microsite.title} required
                                className="bg-zinc-950 border-zinc-800 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Slug URL</Label>
                            <div className="flex items-center rounded-md bg-zinc-950 border border-zinc-800 focus-within:ring-1 focus-within:ring-ring focus-within:border-zinc-700">
                                <span className="bg-zinc-900/50 text-zinc-400 px-3 py-2 text-sm rounded-l-md border-r border-zinc-800 select-none font-mono">
                                    {domainPrefix}
                                </span>
                                <Input
                                    name="slug"
                                    value={slugValue}
                                    onChange={handleSlugChange}
                                    onBlur={handleSlugBlur}
                                    required
                                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white rounded-r-md"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Deskripsi</Label>
                            <Textarea name="description" defaultValue={microsite.description || ""} rows={2}
                                className="bg-zinc-950 border-zinc-800 text-white resize-none" />
                        </div>

                        {/* Cover Image */}
                        <input type="hidden" name="coverImage" value={coverImageUrl} />
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Gambar Cover</Label>
                            <CoverImageUploader
                                currentUrl={coverImageUrl}
                                onUploadComplete={(url) => setCoverImageUrl(url)}
                            />
                        </div>

                        {/* Theme picker */}
                        <input type="hidden" name="theme" value={selectedTheme} />
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Tema Tampilan</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {MICROSITE_THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedTheme(t.id)}
                                        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left flex flex-col ${
                                            selectedTheme === t.id
                                                ? "border-blue-500 shadow-lg shadow-blue-500/20"
                                                : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
                                        }`}
                                    >
                                        {/* Mini preview */}
                                        <div className={`h-24 w-full ${t.preview.bg} flex flex-col items-center justify-center gap-1 p-2 relative overflow-hidden`}>
                                            {/* Miniature header strip (title strip) */}
                                            <div className="w-12 h-1 bg-zinc-400/40 rounded-full mb-1" />
                                            
                                            {/* Avatar / dot */}
                                            <div className={`w-5 h-5 rounded-full ${t.preview.dot} mb-1`} />
                                            
                                            {/* Two link-card shapes */}
                                            <div className={`h-2.5 w-20 rounded ${t.preview.card}`} />
                                            <div className={`h-2.5 w-20 rounded ${t.preview.card}`} />
                                        </div>
                                        
                                        {/* Label & Tagline */}
                                        <div className="p-2 flex-1 flex flex-col justify-between bg-zinc-950/40 w-full">
                                            <div>
                                                <p className={`text-xs font-bold ${selectedTheme === t.id ? "text-blue-400" : "text-zinc-300"}`}>
                                                    {t.label}
                                                    {selectedTheme === t.id && " ✓"}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{t.tagline}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isPending} size="sm"
                                className="bg-primary hover:bg-primary/90 text-white">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Simpan
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleTogglePublished}
                                disabled={isPending} className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white gap-2">
                                {microsite.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {microsite.isPublished ? "Jadikan Draft" : "Publikasikan"}
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={handleDelete}
                                disabled={isPending} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-auto">
                                <Trash2 className="w-4 h-4 mr-2" /> Hapus Microsite
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Links */}
            <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-white text-base">Links ({microsite.links.length})</CardTitle>
                            {isPending && (
                                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Menyimpan...</span>
                                </div>
                            )}
                            {!isPending && showSaveSuccess && (
                                <span className="text-green-500 text-xs font-medium">Tersimpan ✓</span>
                            )}
                        </div>
                        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-primary hover:bg-primary/90 text-white gap-1">
                            <Plus className="w-3.5 h-3.5" /> Tambah Link
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Add link form */}
                    {showAddForm && (
                        <form onSubmit={handleAddLink} className="bg-zinc-950 border border-zinc-700 rounded-xl p-4 space-y-3">
                            <p className="text-sm font-medium text-white">Link Baru</p>
                            <Input name="title" placeholder="Judul link" required
                                className="bg-zinc-900 border-zinc-700 text-white" />
                            <Input name="url" type="url" placeholder="https://..." required
                                className="bg-zinc-900 border-zinc-700 text-white" />
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" disabled={isPending}
                                    className="bg-primary hover:bg-primary/90 text-white">
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Tambah
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    Batal
                                </Button>
                            </div>
                        </form>
                    )}

                    {microsite.links.length === 0 && !showAddForm && (
                        <p className="text-zinc-500 text-sm text-center py-6">
                            Belum ada link. Klik tombol Tambah Link untuk mulai.
                        </p>
                    )}

                    <div className="sr-only" aria-live="polite" aria-atomic="true">
                        {announcement}
                    </div>

                    {linksState.map((link: MicrositeLink, index: number) => (
                        <div key={link.id} className="relative">
                            {/* Drag Insertion Indicator (Top) */}
                            {dragOverIndex === index && dragPosition === "top" && (
                                <div className="h-0.5 w-full bg-blue-500 rounded my-1" />
                            )}
                            <div
                                draggable={!isReorderDisabled}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200 ${
                                    draggingIndex === index ? "opacity-40" : ""
                                }`}
                            >
                                {editLinkId === link.id ? (
                                    <form onSubmit={(e) => handleEditLink(e, link.id)} className="p-4 space-y-3">
                                        <Input name="title" defaultValue={link.title} required
                                            className="bg-zinc-900 border-zinc-700 text-white" />
                                        <Input name="url" type="url" defaultValue={link.url} required
                                            className="bg-zinc-900 border-zinc-700 text-white" />
                                        <select name="isActive" defaultValue={String(link.isActive)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white">
                                            <option value="true">Aktif</option>
                                            <option value="false">Nonaktif</option>
                                        </select>
                                        <div className="flex gap-2">
                                            <Button type="submit" size="sm" disabled={isPending}
                                                className="bg-primary hover:bg-primary/90 text-white">
                                                Simpan
                                            </Button>
                                            <Button type="button" size="sm" variant="ghost" onClick={() => setEditLinkId(null)}
                                                className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                Batal
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                                        {/* First row: Drag handle + link info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Drag handle */}
                                            <div
                                                aria-hidden="true"
                                                tabIndex={-1}
                                                className={`flex-shrink-0 text-zinc-600 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-zinc-900 hover:text-zinc-300 transition-colors ${
                                                    isReorderDisabled ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-zinc-600" : ""
                                                }`}
                                            >
                                                <GripVertical className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${link.isActive ? "text-white" : "text-zinc-500 line-through"}`}>
                                                    {link.title}
                                                </p>
                                                <p className="text-xs text-zinc-600 truncate">{link.url}</p>
                                            </div>
                                        </div>

                                        {/* Second row: Action buttons toolbar (right-aligned flex on mobile, side-aligned on desktop) */}
                                        <div className="flex gap-1 flex-shrink-0 items-center justify-end border-t border-zinc-800/60 pt-3 mt-1 md:border-t-0 md:pt-0 md:mt-0">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="icon" className="w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleLinkVisibility(link)}
                                                disabled={isPending}
                                                className="w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800"
                                                title={link.isActive ? "Sembunyikan link" : "Tampilkan link"}
                                            >
                                                {link.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setEditLinkId(link.id)}
                                                className="w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)}
                                                disabled={isPending}
                                                className="w-7 h-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>

                                            {/* Chevron controls */}
                                            <div className="w-px h-6 bg-zinc-800 mx-1" />
                                            <Button
                                                id={`btn-up-${link.id}`}
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleMoveUp(index)}
                                                disabled={isReorderDisabled || index === 0}
                                                aria-label={`Pindahkan "${link.title}" ke atas`}
                                                className={`w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800 ${
                                                    isReorderDisabled ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-zinc-600" : ""
                                                }`}
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                id={`btn-down-${link.id}`}
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleMoveDown(index)}
                                                disabled={isReorderDisabled || index === linksState.length - 1}
                                                aria-label={`Pindahkan "${link.title}" ke bawah`}
                                                className={`w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800 ${
                                                    isReorderDisabled ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-zinc-600" : ""
                                                }`}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Drag Insertion Indicator (Bottom) */}
                            {dragOverIndex === index && dragPosition === "bottom" && (
                                <div className="h-0.5 w-full bg-blue-500 rounded my-1" />
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
