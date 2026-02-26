"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LinkIcon, Home, BarChart2, Settings, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: Home },
        { name: "Microsites", href: "/dashboard/microsites", icon: Globe },
        { name: "Short Links", href: "/dashboard/links", icon: LinkIcon },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg tracking-tight">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <LinkIcon className="w-4 h-4 text-white" />
                        </div>
                        Taut
                    </Link>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 px-3 py-2 mb-4">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full bg-zinc-800" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-white">
                                {session?.user?.name?.charAt(0) || "U"}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg tracking-tight">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <LinkIcon className="w-4 h-4 text-white" />
                        </div>
                        Taut
                    </Link>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
