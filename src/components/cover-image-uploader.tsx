"use client";

import { useCallback, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverImageUploaderProps {
    currentUrl: string;
    onUploadComplete: (url: string) => void;
    className?: string;
}

export function CoverImageUploader({ currentUrl, onUploadComplete, className }: CoverImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(currentUrl);

    const { startUpload, isUploading } = useUploadThing("micrositeCoverImage", {
        onClientUploadComplete: (res) => {
            if (res?.[0]?.url) {
                setPreview(res[0].url);
                onUploadComplete(res[0].url);
            }
        },
        onUploadError: (err) => {
            alert(`Upload gagal: ${err.message}`);
        },
    });

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) return;
            // Show local preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            startUpload([file]);
        },
        [startUpload]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleClear = () => {
        setPreview("");
        onUploadComplete("");
    };

    return (
        <div className={`space-y-2 ${className || ''}`}>
            {preview ? (
                /* Preview state */
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 h-full w-full group">
                    <img
                        src={preview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                    {!isUploading && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                                <span className="flex items-center gap-1 text-xs bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded-lg transition-colors">
                                    <Upload className="w-3 h-3" /> Ganti
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center gap-1 text-xs bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition-colors"
                            >
                                <X className="w-3 h-3" /> Hapus
                            </button>
                        </div>
                    )}
                    <span className="absolute bottom-2 left-3 text-xs text-white/60">Cover Image</span>
                </div>
            ) : (
                /* Drop zone */
                <label
                    className={`flex flex-col items-center justify-center gap-3 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50"
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <input type="file" accept="image/*" onChange={handleChange} className="hidden" disabled={isUploading} />
                    {isUploading ? (
                        <>
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                            <span className="text-sm text-blue-400">Mengupload...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-zinc-300 font-medium">
                                    Klik untuk upload atau drag &amp; drop
                                </p>
                                <p className="text-xs text-zinc-600 mt-0.5">PNG, JPG, WEBP · Maks. 4MB</p>
                            </div>
                        </>
                    )}
                </label>
            )}
        </div>
    );
}
