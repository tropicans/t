import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGlobalDashboardViewer } from "@/lib/microsite-access";
import { isUserAdmin, getAllUsersForAdmin } from "@/lib/admin";
import { getUserInvitations } from "@/lib/invitations";
import { InvitationForm } from "./invitation-form";
import { InvitationList } from "./invitation-list";
import { UserList } from "./user-list";
import { AdminTabs } from "./admin-tabs";
import { Users, UserPlus, Clock, ShieldCheck } from "lucide-react";

interface InvitationsPageProps {
    searchParams?: Promise<{ tab?: string }> | { tab?: string };
}

export default async function InvitationsPage({ searchParams }: InvitationsPageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/login");
    }

    if (!isUserAdmin(session.user.email)) {
        redirect("/dashboard");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!dbUser) {
        redirect("/dashboard");
    }

    const isGlobalViewer = isGlobalDashboardViewer(session.user.email);
    
    // Fetch invitations and registered users in parallel
    const [invitations, users] = await Promise.all([
        getUserInvitations(dbUser.id, true), // admins can inspect all invitations
        getAllUsersForAdmin(),
    ]);

    // Compute overview metrics
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.isAdmin).length;
    const totalInvitations = invitations.length;
    const now = new Date();
    const activeInvitations = invitations.filter(
        (inv) =>
            inv.status === "PENDING" &&
            inv.usesCount < inv.maxUses &&
            (!inv.expiresAt || new Date(inv.expiresAt) > now)
    ).length;

    const totalClaimedUsers = invitations.reduce(
        (acc, inv) => acc + (inv.claimedUsers ? inv.claimedUsers.length : inv.usesCount),
        0
    );

    // Resolve search params safely for Next.js 14 & 15
    const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
    const defaultTab = resolvedParams?.tab === "invitations" ? "invitations" : "users";

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> Administrasi Sistem
                    </span>
                    {isGlobalViewer && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            Superadmin Mode
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
                    Pengguna & Undangan
                </h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Pantau semua pengguna yang terdaftar di sistem Taut, kelola hak akses administrator, dan terbitkan tautan undangan akses untuk pengguna baru.
                </p>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Total Pengguna</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{totalUsers}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Superadmin</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{adminCount}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Undangan Aktif</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{activeInvitations}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Via Undangan</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{totalClaimedUsers}</p>
                    </div>
                </div>
            </div>

            {/* Admin Tabs */}
            <AdminTabs
                defaultTab={defaultTab}
                usersCount={totalUsers}
                invitationsCount={totalInvitations}
                usersContent={<UserList initialUsers={users} />}
                invitationsContent={
                    <div className="space-y-8">
                        {/* Invitation Creation Form */}
                        <InvitationForm />

                        {/* Invitation History List */}
                        <div className="space-y-4 pt-2">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-foreground">
                                    Riwayat Undangan
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Daftar tautan undangan yang telah diterbitkan beserta status penggunaan dan akun yang terdaftar.
                                </p>
                            </div>

                            <InvitationList
                                initialInvitations={invitations}
                                viewerUserId={dbUser.id}
                                canManageAll={true}
                            />
                        </div>
                    </div>
                }
            />
        </div>
    );
}

