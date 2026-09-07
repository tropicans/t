"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvitationAction } from "@/app/actions/invitations";
import { Link2, Mail, Copy, Check, Sparkles, RefreshCw, Users, Clock } from "lucide-react";

interface CreatedInvitation {
    id: string;
    token: string;
    email: string | null;
    maxUses: number;
    usesCount: number;
    expiresAt: string | null;
    status: string;
}

export function InvitationForm() {
    const [mode, setMode] = useState<"open" | "email">("open");
    const [email, setEmail] = useState("");
    const [maxUses, setMaxUses] = useState(1);
    const [expiresInDays, setExpiresInDays] = useState<number | null>(7);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdInvitation, setCreatedInvitation] = useState<CreatedInvitation | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await createInvitationAction({
                email: mode === "email" ? email : null,
                maxUses: mode === "email" ? 1 : maxUses,
                expiresInDays: expiresInDays,
            });

            if (res.error) {
                setError(res.error);
            } else if (res.invitation) {
                setCreatedInvitation(res.invitation);
                setEmail("");
            }
        } catch {
            setError("Terjadi kesalahan saat memproses permintaan.");
        } finally {
            setIsLoading(false);
        }
    };

    const getInviteUrl = (token: string) => {
        if (typeof window !== "undefined") {
            return `${window.location.origin}/invite/${token}`;
        }
        return `/invite/${token}`;
    };

    const copyToClipboard = (url: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-serif font-bold text-foreground">
                            Buat Tautan Undangan
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Undang anggota tim atau klien untuk membuat akun di Taut tanpa perlu allowlist manual.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {createdInvitation ? (
                    <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                                <Check className="w-3.5 h-3.5" /> Tautan Berhasil Dibuat
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setCreatedInvitation(null);
                                    setCopied(false);
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground h-8"
                            >
                                <RefreshCw className="w-3 h-3 mr-1.5" /> Buat Tautan Baru
                            </Button>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Bagikan tautan ini kepada calon pengguna:</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={getInviteUrl(createdInvitation.token)}
                                    className="font-mono text-sm bg-background border-border select-all"
                                />
                                <Button
                                    type="button"
                                    onClick={() => copyToClipboard(getInviteUrl(createdInvitation.token))}
                                    className={`shrink-0 transition-all font-medium ${
                                        copied
                                            ? "bg-green-600 hover:bg-green-700 text-white"
                                            : "bg-primary hover:bg-terracotta-active text-primary-foreground"
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1.5" /> Tersalin!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1.5" /> Salin Link
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t border-border/40">
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                {createdInvitation.email
                                    ? `Khusus email: ${createdInvitation.email}`
                                    : `Kuota: ${createdInvitation.maxUses} kali pakai`}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {createdInvitation.expiresAt
                                    ? `Masa aktif s.d. ${new Date(createdInvitation.expiresAt).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                      })}`
                                    : "Masa aktif: Tanpa batas"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* Mode Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setMode("open")}
                                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                    mode === "open"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border bg-card hover:bg-muted/30"
                                }`}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                                    <Link2 className="w-4 h-4 text-primary" />
                                    Tautan Terbuka
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Dapat digunakan siapa saja hingga batas kuota tercapai.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("email")}
                                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                    mode === "email"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border bg-card hover:bg-muted/30"
                                }`}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                                    <Mail className="w-4 h-4 text-primary" />
                                    Khusus Email
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Hanya email Google yang ditentukan yang dapat mengklaim.
                                </p>
                            </button>
                        </div>

                        {/* Email Field (when mode === "email") */}
                        {mode === "email" && (
                            <div className="space-y-2 animate-in fade-in duration-200">
                                <Label htmlFor="target-email" className="text-sm font-medium text-foreground">
                                    Alamat Email Calon Pengguna <span className="text-primary">*</span>
                                </Label>
                                <Input
                                    id="target-email"
                                    type="email"
                                    placeholder="nama@perusahaan.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background border-border"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Pengguna harus login Google menggunakan alamat email ini agar akun berhasil dibuat.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Max Uses (only for open mode) */}
                            {mode === "open" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="max-uses" className="text-sm font-medium text-foreground">
                                        Batas Kuota Pemakaian
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        {[1, 5, 10, 25].map((preset) => (
                                            <Button
                                                key={preset}
                                                type="button"
                                                variant={maxUses === preset ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setMaxUses(preset)}
                                                className={`text-xs flex-1 ${
                                                    maxUses === preset
                                                        ? "bg-primary text-primary-foreground hover:bg-terracotta-active"
                                                        : "border-border text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                {preset}x
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-xs text-muted-foreground">Atau kustom:</span>
                                        <Input
                                            id="max-uses"
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={maxUses}
                                            onChange={(e) => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-24 h-8 text-xs bg-background border-border"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">Batas Kuota</Label>
                                    <p className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/40 border border-border">
                                        1 kali pemakaian (akun langsung terhubung ke email yang ditentukan).
                                    </p>
                                </div>
                            )}

                            {/* Expiration Selector */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Masa Aktif Tautan</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "24 Jam", days: 1 },
                                        { label: "7 Hari", days: 7 },
                                        { label: "30 Hari", days: 30 },
                                        { label: "Tanpa Batas", days: null },
                                    ].map((opt) => (
                                        <Button
                                            key={opt.label}
                                            type="button"
                                            variant={expiresInDays === opt.days ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setExpiresInDays(opt.days)}
                                            className={`text-xs ${
                                                expiresInDays === opt.days
                                                    ? "bg-primary text-primary-foreground hover:bg-terracotta-active"
                                                    : "border-border text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-primary hover:bg-terracotta-active text-primary-foreground font-medium rounded-xl px-6"
                            >
                                {isLoading ? "Membuat Tautan..." : "Buat Tautan Undangan"}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
