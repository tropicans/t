"use client";

import { useCallback, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Upload, Loader2, X, UserCircle2 } from "lucide-react";

interface AvatarImageUploaderProps {
    currentUrl: string;
    onUploadComplete: (url: string) => void;
    fallbackInitial?: string;
    className?: string;
}

export function AvatarImageUploader({ currentUrl, onUploadComplete, fallbackInitial, className }: AvatarImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(currentUrl);

    const { startUpload, isUploading } = useUploadThing("micrositeAvatarImage", {
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

    return (
        <div className="flex items-center gap-4">
            <div className={`relative rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-900 flex-shrink-0 group ${className || 'w-16 h-16'}`}>
                {preview ? (
                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-500">
                        {fallbackInitial ? fallbackInitial : <UserCircle2 className="w-8 h-8" />}
                    </div>
                )}

                {isUploading ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                ) : (
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                        <Upload className="w-4 h-4 text-white mb-1" />
                        <span className="text-[10px] text-white">Ganti</span>
                        <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                    </label>
                )}
            </div>

            <div className="flex-1">
                <p className="text-sm text-zinc-300 font-medium">Foto Profil</p>
                <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG, WEBP. Maks 2MB.</p>
                {preview && !isUploading && (
                    <button
                        type="button"
                        onClick={() => { setPreview(""); onUploadComplete(""); }}
                        className="text-xs text-red-400 hover:text-red-300 mt-2 flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3 h-3" /> Hapus Foto
                    </button>
                )}
            </div>
        </div>
    );
}
