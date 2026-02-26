"use client";

import { useTransition, useState, useEffect } from "react";
import { type ShortLink } from "@prisma/client";
import { deleteShortLink } from "@/app/actions/short";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink, QrCode, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import QRCode from "react-qr-code";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function ShortLinkList({ initialLinks }: { initialLinks: ShortLink[] }) {
    const [isPending, startTransition] = useTransition();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        // Get the base URL securely on the client
        setBaseUrl(window.location.origin);
    }, []);

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

                return (
                    <Card key={link.id} className="bg-zinc-900/50 border-zinc-800 transition-all hover:bg-zinc-800/50">
                        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <a
                                        href={fullShortUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-base font-semibold text-blue-400 hover:text-blue-300 truncate"
                                    >
                                        {baseUrl.replace(/^https?:\/\//, "")}/{link.shortCode}
                                    </a>
                                    {link.password && (
                                        <span title="Password Protected" className="flex items-center">
                                            <Lock className="w-3.5 h-3.5 text-zinc-500" />
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-zinc-400 truncate flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {link.originalUrl}
                                </p>
                                <div className="text-xs text-zinc-600 mt-2">
                                    Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    onClick={() => copyToClipboard(link.id, link.shortCode)}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copiedId === link.id ? "Copied!" : "Copy"}
                                </Button>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                            <QrCode className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">QR Code</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl">
                                            <QRCode value={fullShortUrl} size={256} className="w-full max-w-[200px] h-auto" />
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                    onClick={() => handleDelete(link.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
