"use client";

import { useState } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface MicrositeQrCodeProps {
    slug: string;
    title: string;
    variant?: "icon" | "button";
}

export function MicrositeQrCode({ slug, title, variant = "icon" }: MicrositeQrCodeProps) {
    const [copied, setCopied] = useState(false);
    const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || "");
    const fullUrl = `${baseUrl}/${slug}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Gagal menyalin URL", err);
        }
    };

    const handleDownload = () => {
        const svg = document.getElementById(`qr-code-${slug}`);
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `qrcode-${slug}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    };

    const triggerButton = variant === "button" ? (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white gap-2"
        >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
        </Button>
    ) : (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-zinc-500 hover:text-white hover:bg-zinc-800"
            title="Tampilkan QR Code"
        >
            <QrCode className="w-3.5 h-3.5" />
        </Button>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white font-bold">QR Code Microsite</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 gap-6">
                    {/* QR Code Container */}
                    <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                        <QRCode
                            id={`qr-code-${slug}`}
                            value={fullUrl}
                            size={200}
                            className="w-full max-w-[200px] h-auto"
                        />
                    </div>

                    {/* Info & Metadata */}
                    <div className="text-center w-full space-y-1">
                        <h4 className="font-semibold text-base text-zinc-100 truncate max-w-full px-2">
                            {title}
                        </h4>
                        <p className="text-xs text-zinc-400 break-all select-all font-mono max-w-full px-2">
                            {fullUrl}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 gap-2 text-sm h-10"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span>Tersalin!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span>Salin URL</span>
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2 text-sm h-10 shadow-lg shadow-blue-600/20 font-semibold"
                            onClick={handleDownload}
                        >
                            <Download className="w-4 h-4" />
                            <span>Unduh SVG</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
