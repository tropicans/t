"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminUserItem } from "@/lib/admin";
import {
    Search,
    ShieldCheck,
    Globe,
    Link as LinkIcon,
    Calendar,
    Mail,
    UserCheck,
    Users,
    KeyRound
} from "lucide-react";
import Image from "next/image";

interface UserListProps {
    initialUsers: AdminUserItem[];
}

type FilterRole = "ALL" | "ADMIN" | "MEMBER" | "INVITED" | "DIRECT";

const FILTER_TABS: { id: FilterRole; label: string }[] = [
    { id: "ALL", label: "Semua" },
    { id: "ADMIN", label: "Superadmin" },
    { id: "MEMBER", label: "Member" },
    { id: "INVITED", label: "Via Undangan" },
    { id: "DIRECT", label: "Allowlist Langsung" },
];

export function UserList({ initialUsers }: UserListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<FilterRole>("ALL");

    const filteredUsers = useMemo(() => {
        return initialUsers.filter((user) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !query ||
                (user.name?.toLowerCase().includes(query) ?? false) ||
                (user.email?.toLowerCase().includes(query) ?? false) ||
                (user.invitation?.invitedBy?.name?.toLowerCase().includes(query) ?? false) ||
                (user.invitation?.invitedBy?.email?.toLowerCase().includes(query) ?? false) ||
                (user.invitation?.token.toLowerCase().includes(query) ?? false);

            if (!matchesSearch) return false;

            if (filterRole === "ADMIN") return user.isAdmin;
            if (filterRole === "MEMBER") return !user.isAdmin;
            if (filterRole === "INVITED") return Boolean(user.invitationId);
            if (filterRole === "DIRECT") return !user.invitationId;

            return true;
        });
    }, [initialUsers, searchQuery, filterRole]);

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari pengguna berdasarkan nama, email, atau token..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs sm:text-sm bg-card border-border rounded-xl placeholder:text-muted-foreground"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterRole(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                filterRole === tab.id
                                    ? "bg-primary/15 text-primary font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>


            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                    Menampilkan {filteredUsers.length} dari {initialUsers.length} pengguna terdaftar
                </span>
            </div>

            {/* User Cards List */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-card/40 border border-border border-dashed rounded-2xl">
                    <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm font-medium">Tidak ada pengguna yang cocok dengan kriteria.</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user) => {
                        const inviterName = user.invitation?.invitedBy?.name || user.invitation?.invitedBy?.email;
                        return (
                            <Card
                                key={user.id}
                                className="border-border bg-card shadow-xs rounded-xl overflow-hidden hover:border-border/80 transition-colors"
                            >
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* User Identity */}
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user.name || "Avatar"}
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-full border border-border shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                                                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                            )}

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-foreground text-sm truncate">
                                                        {user.name || "Tanpa Nama"}
                                                    </span>

                                                    {/* Role Badge */}
                                                    {user.isAdmin ? (
                                                        <Badge className="bg-primary/15 text-primary border-primary/25 hover:bg-primary/20 text-[11px] font-semibold gap-1 py-0 px-2">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            Superadmin
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-muted/40 text-muted-foreground border-border text-[11px] py-0 px-2">
                                                            Member
                                                        </Badge>
                                                    )}

                                                    {/* Registration Origin Badge */}
                                                    {user.invitation ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium">
                                                            <UserCheck className="w-3 h-3" />
                                                            Via Undangan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md font-medium">
                                                            <KeyRound className="w-3 h-3" />
                                                            Allowlist Langsung
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-1 font-mono">
                                                        <Mail className="w-3 h-3 text-muted-foreground/70" />
                                                        {user.email}
                                                    </span>

                                                    {inviterName && (
                                                        <span className="text-xs text-muted-foreground/80">
                                                            • Diundang oleh <span className="font-medium text-foreground">{inviterName}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity & Metadata Metrics */}
                                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40 text-xs shrink-0">
                                            {/* Resource Counts */}
                                            <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                                                <div className="flex items-center gap-1.5 text-muted-foreground" title="Total Microsites Dibuat">
                                                    <Globe className="w-3.5 h-3.5 text-primary" />
                                                    <span className="font-semibold text-foreground">{user._count.microsites}</span>
                                                    <span className="text-[11px] hidden md:inline">site</span>
                                                </div>
                                                <div className="w-px h-3 bg-border" />
                                                <div className="flex items-center gap-1.5 text-muted-foreground" title="Total Short Links Dibuat">
                                                    <LinkIcon className="w-3.5 h-3.5 text-primary" />
                                                    <span className="font-semibold text-foreground">{user._count.shortLinks}</span>
                                                    <span className="text-[11px] hidden md:inline">link</span>
                                                </div>
                                            </div>

                                            {/* Joined Date */}
                                            <div className="flex items-center gap-1 text-muted-foreground" title="Tanggal Bergabung">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                <span className="text-[11px]">
                                                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
