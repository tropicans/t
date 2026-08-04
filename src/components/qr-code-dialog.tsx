"use client";

import { useState } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { ModernQrCode } from "./modern-qr-code";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface QrCodeDialogProps {
    url: string;
    title: string;
    downloadFilename: string;
    dialogTitle?: string;
    variant?: "icon" | "button";
    trigger?: React.ReactNode;
    subtitle?: string;
}

export function QrCodeDialog({
    url,
    title,
    downloadFilename,
    dialogTitle = "QR Code",
    variant = "icon",
    trigger,
    subtitle,
}: QrCodeDialogProps) {
    const [copied, setCopied] = useState(false);
    
    // Generate a unique ID for the SVG element to avoid conflicts when multiple QR codes are rendered
    const uniqueId = `qr-code-${encodeURIComponent(downloadFilename)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Gagal menyalin URL", err);
        }
    };

    const handleDownload = () => {
        const canvas = document.getElementById(uniqueId) as HTMLCanvasElement;
        if (!canvas) return;
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${downloadFilename}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const defaultTrigger = trigger || (
        variant === "button" ? (
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
        )
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {defaultTrigger}
            </DialogTrigger>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-md bg-zinc-950 border-zinc-800 text-white overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-white font-bold text-lg">{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 gap-6">
                    {/* QR Code Container */}
                    <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                        <ModernQrCode
                            id={uniqueId}
                            value={url}
                            size={200}
                        />
                    </div>

                    {/* Info & Metadata */}
                    <div className="text-center w-full space-y-2 px-1 overflow-hidden">
                        <h4 className="font-semibold text-sm sm:text-base text-zinc-100 break-words text-center px-4 max-w-full leading-relaxed">
                            {title}
                        </h4>
                        <p className="text-xs text-zinc-400 break-all select-all font-mono max-w-full px-4 text-center">
                            {url}
                        </p>
                        {subtitle && (
                            <p className="text-[10px] text-zinc-500 break-all line-clamp-1 max-w-full px-4 text-center mt-1" title={subtitle}>
                                Tujuan: {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full mt-2">
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
                            <span>Unduh PNG</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
