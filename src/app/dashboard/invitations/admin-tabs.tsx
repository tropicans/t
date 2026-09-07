"use client";

import { useState } from "react";
import { Users, Ticket } from "lucide-react";

interface AdminTabsProps {
    defaultTab?: "users" | "invitations";
    usersCount: number;
    invitationsCount: number;
    usersContent: React.ReactNode;
    invitationsContent: React.ReactNode;
}

export function AdminTabs({
    defaultTab = "users",
    usersCount,
    invitationsCount,
    usersContent,
    invitationsContent,
}: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<"users" | "invitations">(defaultTab);

    return (
        <div className="space-y-6">
            {/* Tab Navigation Header */}
            <div className="flex items-center border-b border-border/80 gap-6">
                <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative ${
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
                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative ${
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
            </div>

            {/* Tab Content */}
            <div className="pt-1">
                {activeTab === "users" ? usersContent : invitationsContent}
            </div>
        </div>
    );
}
