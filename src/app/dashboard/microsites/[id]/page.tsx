export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MicrositeEditor } from "./microsite-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Eye, EyeOff } from "lucide-react";
import { isGlobalMicrositeViewer } from "@/lib/microsite-access";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditMicrositePage({ params }: Props) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const canViewAllMicrosites = isGlobalMicrositeViewer(session.user.email);

    // Use email-based lookup for reliability (id may not be in token if DB query failed)
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) redirect("/login");

    const { id } = await params;

    const microsite = await prisma.microsite.findUnique({
        where: { id },
        include: {
            links: { orderBy: { order: "asc" } },
            _count: { select: { clicks: true } },
            user: { select: { name: true, email: true } },
        },
    });

    if (!microsite || (!canViewAllMicrosites && microsite.userId !== dbUser.id)) notFound();

    const isOwner = microsite.userId === dbUser.id;

    if (!isOwner) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
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
                        <p className="text-zinc-500 text-sm">
                            /{microsite.slug} · dibuat oleh {microsite.user.name || microsite.user.email || "Tanpa nama"}
                        </p>
                    </div>
                    <a href={`/${microsite.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white gap-2">
                            <ExternalLink className="w-3.5 h-3.5" /> Buka
                        </Button>
                    </a>
                </div>

                <Card className="bg-zinc-900/60 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Detail Microsite</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-zinc-500">Owner</p>
                            <p className="text-white">{microsite.user.name || "Tanpa nama"}</p>
                            <p className="text-zinc-400">{microsite.user.email}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500">Deskripsi</p>
                            <p className="text-white">{microsite.description || "Tidak ada deskripsi"}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-zinc-500">Tema</p>
                                <p className="text-white capitalize">{microsite.theme}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Status</p>
                                <p className="text-white flex items-center gap-2">
                                    {microsite.isPublished ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                                    {microsite.isPublished ? "Publik" : "Draft"}
                                </p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Klik</p>
                                <p className="text-white">{microsite._count.clicks}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/60 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Links ({microsite.links.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {microsite.links.length === 0 ? (
                            <p className="text-zinc-500 text-sm">Microsite ini belum punya link.</p>
                        ) : (
                            microsite.links.map((link) => (
                                <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium ${link.isActive ? "text-white" : "text-zinc-500 line-through"}`}>
                                            {link.title}
                                        </p>
                                        <p className="truncate text-xs text-zinc-600">{link.url}</p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {link.isActive ? "Tampil" : "Disembunyikan"}
                                        </p>
                                    </div>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-500 hover:text-white hover:bg-zinc-800">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </a>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <MicrositeEditor microsite={microsite} />;
}
