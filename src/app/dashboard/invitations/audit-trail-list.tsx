"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    Clock,
    Activity,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Trash2,
    RefreshCw,
} from "lucide-react";
import type { Prisma } from "@prisma/client";

export interface AuditLogItem {
    id: string;
    userId: string | null;
    userEmail: string | null;
    userName: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    details: Prisma.JsonValue | null;
    ipAddress: string | null;
    createdAt: string | Date;
}

interface AuditTrailListProps {
    initialLogs: AuditLogItem[];
}

type FilterCategory = "ALL" | "SHORT_LINK" | "MICROSITE" | "INVITATION" | "USER_ROLE";

const CATEGORY_TABS: { id: FilterCategory; label: string }[] = [
    { id: "ALL", label: "Semua Aktivitas" },
    { id: "SHORT_LINK", label: "Short Links" },
    { id: "MICROSITE", label: "Microsites" },
    { id: "INVITATION", label: "Undangan" },
    { id: "USER_ROLE", label: "Role User" },
];

function getActionBadge(action: string) {
    if (action.endsWith("_CREATE")) {
        return (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 text-[11px] gap-1 py-0 px-2 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                {action}
            </Badge>
        );
    }
    if (action.endsWith("_DELETE") || action.endsWith("_REVOKE")) {
        return (
            <Badge className="bg-destructive/15 text-destructive border-destructive/25 text-[11px] gap-1 py-0 px-2 font-mono">
                <Trash2 className="w-3 h-3" />
                {action}
            </Badge>
        );
    }
    if (action.includes("UPDATE") || action.includes("REORDER")) {
        return (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25 text-[11px] gap-1 py-0 px-2 font-mono">
                <RefreshCw className="w-3 h-3" />
                {action}
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[11px] gap-1 py-0 px-2 font-mono">
            <Activity className="w-3 h-3" />
            {action}
        </Badge>
    );
}

export function AuditTrailList({ initialLogs }: AuditTrailListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<FilterCategory>("ALL");
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredLogs = useMemo(() => {
        return initialLogs.filter((log) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !query ||
                (log.userName?.toLowerCase().includes(query) ?? false) ||
                (log.userEmail?.toLowerCase().includes(query) ?? false) ||
                log.action.toLowerCase().includes(query) ||
                log.entity.toLowerCase().includes(query) ||
                (log.entityId?.toLowerCase().includes(query) ?? false);

            if (!matchesSearch) return false;

            if (filterCategory === "SHORT_LINK") return log.entity === "ShortLink" || log.action.startsWith("SHORT_LINK");
            if (filterCategory === "MICROSITE") return log.entity === "Microsite" || log.entity === "MicrositeLink" || log.action.startsWith("MICROSITE");
            if (filterCategory === "INVITATION") return log.entity === "Invitation" || log.action.startsWith("INVITATION");
            if (filterCategory === "USER_ROLE") return log.action.startsWith("USER_ROLE");

            return true;
        });
    }, [initialLogs, searchQuery, filterCategory]);

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan nama, email, tindakan, atau ID entitas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs sm:text-sm bg-card border-border rounded-xl placeholder:text-muted-foreground"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {CATEGORY_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterCategory(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                filterCategory === tab.id
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
                    Menampilkan {filteredLogs.length} dari {initialLogs.length} log audit sistem
                </span>
            </div>

            {/* Audit Logs List */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-card/40 border border-border border-dashed rounded-2xl">
                    <Activity className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm font-medium">Belum ada aktivitas tercatat yang sesuai filter.</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">Setiap mutasi short links, microsites, role, dan undangan akan muncul di sini.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => {
                        const isExpanded = Boolean(expandedIds[log.id]);
                        const dateObj = new Date(log.createdAt);
                        const formattedDate = dateObj.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        });
                        const formattedTime = dateObj.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        });

                        return (
                            <Card
                                key={log.id}
                                className="border-border bg-card shadow-xs rounded-xl overflow-hidden hover:border-border/80 transition-colors"
                            >
                                <CardContent className="p-4 sm:p-4.5">
                                    <div className="flex flex-col gap-3">
                                        {/* Main Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            {/* Action & Entity Info */}
                                            <div className="flex items-start sm:items-center gap-2.5 flex-wrap">
                                                {getActionBadge(log.action)}
                                                <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-border text-[11px]">
                                                    {log.entity}
                                                </Badge>
                                                {log.entityId && (
                                                    <span className="font-mono text-[11px] text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded">
                                                        ID: {log.entityId.slice(0, 12)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                <span>
                                                    {formattedDate}, {formattedTime}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actor & Collapsible Details Row */}
                                        <div className="flex items-center justify-between gap-3 text-xs border-t border-border/40 pt-2.5">
                                            {/* Actor Information */}
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                                                    {log.userName?.charAt(0).toUpperCase() || log.userEmail?.charAt(0).toUpperCase() || "A"}
                                                </div>
                                                <span className="font-medium text-foreground">
                                                    {log.userName || "Sistem / User"}
                                                </span>
                                                {log.userEmail && (
                                                    <span className="font-mono text-muted-foreground/80">
                                                        ({log.userEmail})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Expand Details Trigger */}
                                            {log.details && typeof log.details === "object" && Object.keys(log.details).length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpand(log.id)}
                                                    className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                                                >
                                                    <span>{isExpanded ? "Tutup Detail" : "Lihat Detail"}</span>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Collapsible Details Body */}
                                        {isExpanded && log.details && (
                                            <div className="mt-1 p-3 rounded-lg bg-muted/40 border border-border/60 font-mono text-xs text-foreground overflow-x-auto">
                                                <pre className="whitespace-pre-wrap break-all text-[11px] text-muted-foreground">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </div>
                                        )}
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
