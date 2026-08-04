"use client";

import { QrCodeDialog } from "./qr-code-dialog";

interface MicrositeQrCodeProps {
    slug: string;
    title: string;
    variant?: "icon" | "button";
}

export function MicrositeQrCode({ slug, title, variant = "icon" }: MicrositeQrCodeProps) {
    const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || "");
    const fullUrl = `${baseUrl}/${slug}`;

    return (
        <QrCodeDialog
            url={fullUrl}
            title={title}
            downloadFilename={`qrcode-${slug}`}
            dialogTitle="QR Code Microsite"
            variant={variant}
        />
    );
}

