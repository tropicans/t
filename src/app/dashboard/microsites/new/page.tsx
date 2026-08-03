"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMicrosite } from "@/app/actions/microsite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CoverImageUploader } from "@/components/cover-image-uploader";
import { AvatarImageUploader } from "@/components/avatar-image-uploader";
import { MICROSITE_THEMES } from "@/lib/microsite-themes";



function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Terjadi kesalahan";
}

export default function NewMicrositePage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState("dark");
    const [slugValue, setSlugValue] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [avatarImageUrl, setAvatarImageUrl] = useState("");
    const [displayDomain, setDisplayDomain] = useState("");

    useEffect(() => {
        setDisplayDomain(window.location.host);
    }, []);

    function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
        const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
        setSlugValue(cleaned);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        formData.set("theme", selectedTheme);

        startTransition(async () => {
            try {
                const result = await createMicrosite(formData);
                if (result.success) {
                    router.push(`/dashboard/microsites/${result.microsite.id}`);
                }
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/microsites">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Buat Microsite</h1>
                    <p className="text-zinc-400 text-sm">Isi informasi dasar microsite kamu</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Visual Config (Images) */}
                <div className="relative">
                    {/* Cover Image Uploader */}
                    <div className="absolute inset-x-0 -top-8 -z-10">
                        <CoverImageUploader
                            currentUrl={coverImageUrl}
                            onUploadComplete={setCoverImageUrl}
                            className="h-48 sm:h-64 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 relative overflow-hidden group"
                        />
                        <input type="hidden" name="coverImage" value={coverImageUrl} />
                    </div>

                    {/* Fake spacing so subsequent elements lay out correctly underneath the absolute cover image */}
                    <div className="h-40 sm:h-56"></div>

                    {/* Avatar Uploader */}
                    <div className="relative z-10 -mt-16 sm:-mt-20 ml-6 sm:ml-8 mb-6">
                        <div className="bg-zinc-950 p-1 rounded-full inline-block shadow-xl">
                            <AvatarImageUploader
                                currentUrl={avatarImageUrl}
                                fallbackInitial={slugValue.charAt(0).toUpperCase() || "T"}
                                onUploadComplete={setAvatarImageUrl}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-dashed border-zinc-800 bg-zinc-900 group relative overflow-hidden"
                            />
                            <input type="hidden" name="avatarImage" value={avatarImageUrl} />
                        </div>
                    </div>
                </div>

                <Card className="bg-zinc-900/60 border-zinc-800 mt-2">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Informasi Dasar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Judul Microsite</Label>
                            <Input
                                name="title"
                                placeholder="contoh: Webinar ASN 2025"
                                required
                                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">URL Slug</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-sm">{displayDomain || "t.ppkasn.id"}/</span>
                                <Input
                                    name="slug"
                                    value={slugValue}
                                    onChange={handleSlugChange}
                                    placeholder="webinar-asn-2025"
                                    required
                                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                                />
                            </div>
                            <p className="text-xs text-zinc-600">Hanya huruf kecil, angka, dan tanda hubung (-)</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Deskripsi <span className="text-zinc-600">(opsional)</span></Label>
                            <Textarea
                                name="description"
                                placeholder="Deskripsi singkat microsite ini..."
                                rows={3}
                                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/60 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Tema</CardTitle>
                        <CardDescription className="text-zinc-500">Pilih tampilan halaman publikmu</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                        {error}
                    </p>
                )}

                <div className="flex gap-3">
                    <Link href="/dashboard/microsites" className="flex-1">
                        <Button variant="outline" className="w-full bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isPending ? "Membuat..." : "Buat Microsite"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
