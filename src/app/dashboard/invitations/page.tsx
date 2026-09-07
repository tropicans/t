import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGlobalDashboardViewer } from "@/lib/microsite-access";
import { isUserAdmin } from "@/lib/admin";
import { getUserInvitations } from "@/lib/invitations";
import { InvitationForm } from "./invitation-form";
import { InvitationList } from "./invitation-list";
import { Users, UserPlus, CheckCircle, Clock } from "lucide-react";

export default async function InvitationsPage() {
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
    const invitations = await getUserInvitations(dbUser.id, isGlobalViewer);

    // Compute overview metrics
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

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <UserPlus className="w-3.5 h-3.5" /> Administrasi
                    </span>
                    {isGlobalViewer && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            Mode Superadmin
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
                    Manajemen Undangan
                </h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Buat tautan undangan khusus untuk memberikan akses ke dashboard dan fitur Taut kepada pengguna baru tanpa perlu mengubah allowlist server manual.
                </p>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Total Undangan Dibuat</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{totalInvitations}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Tautan Undangan Aktif</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{activeInvitations}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Pengguna Bergabung</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{totalClaimedUsers}</p>
                    </div>
                </div>
            </div>

            {/* Invitation Creation Form */}
            <InvitationForm />

            {/* Invitation History List */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-foreground">
                            Riwayat Undangan
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Daftar tautan undangan yang telah Anda terbitkan beserta status penggunaan dan akun yang terdaftar.
                        </p>
                    </div>
                </div>

                <InvitationList
                    initialInvitations={invitations as any}
                    viewerUserId={dbUser.id}
                    canManageAll={isGlobalViewer}
                />
            </div>
        </div>
    );
}
