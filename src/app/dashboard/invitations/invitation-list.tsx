"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revokeInvitationAction } from "@/app/actions/invitations";
import { Copy, Check, Ban, Mail, Users, Clock, AlertCircle, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import Image from "next/image";

export interface ClaimedUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date | string;
}

export interface InvitationItem {
    id: string;
    token: string;
    email: string | null;
    invitedById: string;
    maxUses: number;
    usesCount: number;
    expiresAt: Date | string | null;
    status: string;
    createdAt: Date | string;
    invitedBy?: {
        id: string;
        name: string | null;
        email: string | null;
    };
    claimedUsers: ClaimedUser[];
}

interface InvitationListProps {
    initialInvitations: InvitationItem[];
    viewerUserId: string;
    canManageAll?: boolean;
}

export function InvitationList({ initialInvitations, viewerUserId, canManageAll }: InvitationListProps) {
    const [invitations, setInvitations] = useState<InvitationItem[]>(initialInvitations);
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "EXHAUSTED" | "REVOKED">("ALL");
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
    const [expandedClaimedId, setExpandedClaimedId] = useState<string | null>(null);

    // Sync when props change
    if (initialInvitations !== invitations && initialInvitations.length !== invitations.length) {
        setInvitations(initialInvitations);
    }

    const getComputedStatus = (inv: InvitationItem): "ACTIVE" | "EXHAUSTED" | "EXPIRED" | "REVOKED" => {
        if (inv.status === "REVOKED") return "REVOKED";
        if (inv.status === "EXPIRED" || (inv.expiresAt && new Date() > new Date(inv.expiresAt))) {
            return "EXPIRED";
        }
        if (inv.usesCount >= inv.maxUses || inv.status === "ACCEPTED") {
            return "EXHAUSTED";
        }
        return "ACTIVE";
    };

    const filteredInvitations = invitations.filter((inv) => {
        const computed = getComputedStatus(inv);
        if (filter === "ALL") return true;
        if (filter === "ACTIVE") return computed === "ACTIVE";
        if (filter === "EXHAUSTED") return computed === "EXHAUSTED" || computed === "EXPIRED";
        if (filter === "REVOKED") return computed === "REVOKED";
        return true;
    });

    const getInviteUrl = (token: string) => {
        if (typeof window !== "undefined") {
            return `${window.location.origin}/invite/${token}`;
        }
        return `/invite/${token}`;
    };

    const copyToClipboard = (token: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(getInviteUrl(token));
            setCopiedToken(token);
            setTimeout(() => setCopiedToken(null), 2500);
        }
    };

    const handleRevoke = async (id: string) => {
        setRevokingId(id);
        try {
            const res = await revokeInvitationAction(id);
            if (res.success) {
                setInvitations((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, status: "REVOKED" } : item))
                );
            } else if (res.error) {
                alert(res.error);
            }
        } catch {
            alert("Gagal mencabut undangan.");
        } finally {
            setRevokingId(null);
            setConfirmRevokeId(null);
        }
    };

    const renderStatusBadge = (status: "ACTIVE" | "EXHAUSTED" | "EXPIRED" | "REVOKED") => {
        switch (status) {
            case "ACTIVE":
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 font-medium text-xs">
                        Aktif
                    </Badge>
                );
            case "EXHAUSTED":
                return (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 font-medium text-xs">
                        Habis Terpakai
                    </Badge>
                );
            case "EXPIRED":
                return (
                    <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/15 dark:text-slate-400 font-medium text-xs">
                        Kedaluwarsa
                    </Badge>
                );
            case "REVOKED":
                return (
                    <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 font-medium text-xs">
                        Dicabut
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-1.5">
                    {[
                        { id: "ALL", label: "Semua" },
                        { id: "ACTIVE", label: "Aktif" },
                        { id: "EXHAUSTED", label: "Selesai / Kedaluwarsa" },
                        { id: "REVOKED", label: "Dicabut" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                filter === tab.id
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">
                    Menampilkan {filteredInvitations.length} dari {invitations.length} undangan
                </span>
            </div>

            {/* List */}
            {filteredInvitations.length === 0 ? (
                <div className="text-center py-12 bg-card/40 border border-border border-dashed rounded-2xl">
                    <p className="text-muted-foreground text-sm">Tidak ada undangan pada kategori ini.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredInvitations.map((invitation) => {
                        const status = getComputedStatus(invitation);
                        const isRevocable =
                            status === "ACTIVE" &&
                            (invitation.invitedById === viewerUserId || canManageAll);
                        const progressPercent = Math.min(
                            100,
                            Math.round((invitation.usesCount / invitation.maxUses) * 100)
                        );
                        const isExpanded = expandedClaimedId === invitation.id;

                        return (
                            <Card
                                key={invitation.id}
                                className="border-border bg-card shadow-xs rounded-xl overflow-hidden hover:border-border/80 transition-colors"
                            >
                                <CardContent className="p-4 sm:p-5 space-y-3.5">
                                    <div className="flex items-start justify-between flex-wrap gap-3">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {renderStatusBadge(status)}
                                                {invitation.email ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                                        <Mail className="w-3 h-3" />
                                                        {invitation.email}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                                                        <Users className="w-3 h-3" />
                                                        Tautan Terbuka
                                                    </span>
                                                )}
                                                {canManageAll && invitation.invitedBy && (
                                                    <span className="text-xs text-muted-foreground">
                                                        oleh: {invitation.invitedBy.name || invitation.invitedBy.email}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="font-mono text-xs text-muted-foreground truncate pt-0.5 select-all">
                                                token: {invitation.token}
                                            </p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(invitation.token)}
                                                className={`text-xs h-8 rounded-lg border-border transition-colors ${
                                                    copiedToken === invitation.token
                                                        ? "border-green-500/50 text-green-600 bg-green-50/50 dark:bg-green-950/20"
                                                        : "hover:bg-muted text-foreground"
                                                }`}
                                            >
                                                {copiedToken === invitation.token ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                                                        Tersalin
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5 mr-1" />
                                                        Salin Link
                                                    </>
                                                )}
                                            </Button>

                                            {isRevocable && (
                                                <>
                                                    {confirmRevokeId === invitation.id ? (
                                                        <div className="flex items-center gap-1 animate-in fade-in duration-200">
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                disabled={revokingId === invitation.id}
                                                                onClick={() => handleRevoke(invitation.id)}
                                                                className="text-xs h-8 rounded-lg"
                                                            >
                                                                {revokingId === invitation.id ? "Mencabut..." : "Ya, Cabut"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setConfirmRevokeId(null)}
                                                                className="text-xs h-8 rounded-lg text-muted-foreground"
                                                            >
                                                                Batal
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setConfirmRevokeId(invitation.id)}
                                                            className="text-xs h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Ban className="w-3.5 h-3.5 mr-1" />
                                                            Cabut
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress and Metadata */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span>Penggunaan Kuota</span>
                                                <span className="font-medium text-foreground">
                                                    {invitation.usesCount} / {invitation.maxUses} ({progressPercent}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all rounded-full ${
                                                        status === "REVOKED"
                                                            ? "bg-rose-500"
                                                            : progressPercent >= 100
                                                            ? "bg-amber-500"
                                                            : "bg-primary"
                                                    }`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-primary" />
                                                <span>
                                                    {invitation.expiresAt
                                                        ? `Berlaku s.d. ${new Date(
                                                              invitation.expiresAt
                                                          ).toLocaleDateString("id-ID", {
                                                              day: "numeric",
                                                              month: "short",
                                                              year: "numeric",
                                                          })}`
                                                        : "Tanpa batas kedaluwarsa"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Claimed Users Section */}
                                    {invitation.claimedUsers && invitation.claimedUsers.length > 0 && (
                                        <div className="pt-2 border-t border-border/40">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedClaimedId(isExpanded ? null : invitation.id)
                                                }
                                                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                                                    {invitation.claimedUsers.length} Pengguna Mengklaim Undangan
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                )}
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-2 space-y-1.5 pl-5 animate-in fade-in duration-200">
                                                    {invitation.claimedUsers.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-muted/40"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {user.image ? (
                                                                    <Image
                                                                        src={user.image}
                                                                        alt={user.name || "Avatar"}
                                                                        width={18}
                                                                        height={18}
                                                                        className="w-4 h-4 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                                                        {user.name?.charAt(0) || "U"}
                                                                    </div>
                                                                )}
                                                                <span className="font-medium text-foreground">
                                                                    {user.name || "Pengguna"}
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    ({user.email})
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
