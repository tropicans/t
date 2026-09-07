"use client";

import { useTransition, useState } from "react";
import { type ShortLink } from "@prisma/client";
import { deleteShortLink } from "@/app/actions/short";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { QrCodeDialog } from "@/components/qr-code-dialog";

type ShortLinkWithOwner = ShortLink & {
    user: {
        name: string | null;
        email: string | null;
    } | null;
};

interface ShortLinkListProps {
    initialLinks: ShortLinkWithOwner[];
    viewerUserId: string;
    canViewAllLinks: boolean;
}

export function ShortLinkList({ initialLinks, viewerUserId, canViewAllLinks }: ShortLinkListProps) {
    const [isPending, startTransition] = useTransition();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || "");

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this short link?")) {
            startTransition(async () => {
                await deleteShortLink(id);
            });
        }
    };


    const copyToClipboard = async (id: string, shortCode: string) => {
        const fullUrl = `${baseUrl}/${shortCode}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-4">
            {initialLinks.map((link) => {
                const fullShortUrl = `${baseUrl}/${link.shortCode}`;
                const isOwner = link.userId === viewerUserId;

                return (
                    <Card key={link.id} className="bg-card border-border transition-all hover:border-primary/40">
                        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <a
                                        href={fullShortUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-base font-semibold text-primary hover:text-terracotta-active truncate"
                                    >
                                        {baseUrl.replace(/^https?:\/\//, "")}/{link.shortCode}
                                    </a>
                                    {link.password && (
                                        <span title="Password Protected" className="flex items-center">
                                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {link.originalUrl}
                                </p>
                                <div className="text-xs text-muted-foreground mt-2">
                                    Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                                </div>
                                {canViewAllLinks && !isOwner ? (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Owner: {link.user?.name || link.user?.email || "Tanpa nama"}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                    onClick={() => copyToClipboard(link.id, link.shortCode)}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copiedId === link.id ? "Copied!" : "Copy"}
                                </Button>

                                <QrCodeDialog
                                    url={fullShortUrl}
                                    title={`/${link.shortCode}`}
                                    subtitle={link.originalUrl}
                                    downloadFilename={`qrcode-${link.shortCode}`}
                                    dialogTitle="QR Code Link"
                                    variant="icon"
                                />

                                {isOwner ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(link.id)}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
