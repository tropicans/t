"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    updateMicrosite,
    deleteMicrosite,
    createMicrositeLink,
    updateMicrositeLink,
    deleteMicrositeLink,
} from "@/app/actions/microsite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, ExternalLink, Trash2, Pencil, Loader2, Eye, EyeOff, Globe } from "lucide-react";
import { CoverImageUploader } from "@/components/cover-image-uploader";
import { AvatarImageUploader } from "@/components/avatar-image-uploader";
import Link from "next/link";
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

export function MicrositeEditor({ microsite }: { microsite: MicrositeWithLinks }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editLinkId, setEditLinkId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState(microsite.theme || "dark");
    const [coverImageUrl, setCoverImageUrl] = useState(microsite.coverImage || "");
    const [avatarImageUrl, setAvatarImageUrl] = useState(microsite.avatarImage || "");

    const THEMES = [
        {
            id: "dark",
            label: "Dark",
            bg: "bg-zinc-950",
            preview: "bg-gradient-to-b from-zinc-900 to-zinc-950",
            cardBg: "bg-zinc-800",
            dot: "bg-zinc-400",
        },
        {
            id: "light",
            label: "Light",
            bg: "bg-gray-100",
            preview: "bg-gradient-to-b from-white to-gray-100",
            cardBg: "bg-white border border-gray-200",
            dot: "bg-gray-400",
        },
        {
            id: "gradient",
            label: "Gradient",
            bg: "bg-blue-950",
            preview: "bg-gradient-to-b from-blue-900 via-purple-900 to-zinc-950",
            cardBg: "bg-white/20",
            dot: "bg-blue-300",
        },
    ];

    // --- Update microsite info ---
    function handleUpdateInfo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await updateMicrosite(microsite.id, formData);
                router.refresh();
            } catch (err: any) {
                setError(err.message);
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
            } catch (err: any) {
                setError(err.message);
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
            } catch (err: any) {
                setError(err.message);
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
                                {THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedTheme(t.id)}
                                        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedTheme === t.id
                                            ? "border-blue-500 shadow-lg shadow-blue-500/20"
                                            : "border-zinc-700 hover:border-zinc-500"
                                            }`}
                                    >
                                        {/* Mini preview */}
                                        <div className={`h-20 w-full ${t.preview} flex flex-col items-center justify-center gap-1.5 p-2`}>
                                            <div className={`w-6 h-6 rounded-full ${t.dot} opacity-80`} />
                                            <div className={`h-2 w-12 rounded-full ${t.cardBg} opacity-70`} />
                                            <div className={`h-2 w-10 rounded-full ${t.cardBg} opacity-50`} />
                                        </div>
                                        <div className={`py-1.5 text-center text-xs font-medium ${selectedTheme === t.id ? "text-blue-400" : "text-zinc-400"
                                            } ${t.bg}`}>
                                            {t.label}
                                            {selectedTheme === t.id && " ✓"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isPending} size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white">
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
                        <CardTitle className="text-white text-base">Links ({microsite.links.length})</CardTitle>
                        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white">
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
                            Belum ada link. Klik "Tambah Link" untuk mulai.
                        </p>
                    )}

                    {microsite.links.map((link: MicrositeLink) => (
                        <div key={link.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
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
                                            className="bg-blue-600 hover:bg-blue-700 text-white">
                                            Simpan
                                        </Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditLinkId(null)}
                                            className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                            Batal
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${link.isActive ? "text-white" : "text-zinc-500 line-through"}`}>
                                            {link.title}
                                        </p>
                                        <p className="text-xs text-zinc-600 truncate">{link.url}</p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" className="w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                        </a>
                                        <Button variant="ghost" size="icon" onClick={() => setEditLinkId(link.id)}
                                            className="w-7 h-7 text-zinc-600 hover:text-white hover:bg-zinc-800">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)}
                                            disabled={isPending}
                                            className="w-7 h-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
