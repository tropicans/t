"use client";

import { useState } from "react";
import { Users, Ticket, Activity } from "lucide-react";

interface AdminTabsProps {
    defaultTab?: "users" | "invitations" | "audit";
    usersCount: number;
    invitationsCount: number;
    auditCount?: number;
    usersContent: React.ReactNode;
    invitationsContent: React.ReactNode;
    auditContent?: React.ReactNode;
}

export function AdminTabs({
    defaultTab = "users",
    usersCount,
    invitationsCount,
    auditCount = 0,
    usersContent,
    invitationsContent,
    auditContent,
}: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<"users" | "invitations" | "audit">(defaultTab);

    return (
        <div className="space-y-6">
            {/* Tab Navigation Header */}
            <div className="flex items-center border-b border-border/80 gap-6 overflow-x-auto scrollbar-none">
                <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                        activeTab === "users"
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Daftar Pengguna</span>
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                            activeTab === "users"
                                ? "bg-primary/15 text-primary font-semibold"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                        {usersCount}
                    </span>
                    {activeTab === "users" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("invitations")}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                        activeTab === "invitations"
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Ticket className="w-4 h-4" />
                    <span>Tautan Undangan</span>
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                            activeTab === "invitations"
                                ? "bg-primary/15 text-primary font-semibold"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                        {invitationsCount}
                    </span>
                    {activeTab === "invitations" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>

                {auditContent && (
                    <button
                        type="button"
                        onClick={() => setActiveTab("audit")}
                        className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                            activeTab === "audit"
                                ? "text-primary font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        <span>Audit Trail</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                                activeTab === "audit"
                                    ? "bg-primary/15 text-primary font-semibold"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {auditCount}
                        </span>
                        {activeTab === "audit" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="pt-1">
                {activeTab === "users" && usersContent}
                {activeTab === "invitations" && invitationsContent}
                {activeTab === "audit" && auditContent}
            </div>
        </div>
    );
}
