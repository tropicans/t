import { getInvitationByToken, validateInvitationStatus } from "@/lib/invitations";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { InviteAction } from "./invite-action";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, AlertCircle, Clock, Users, Mail } from "lucide-react";

interface PageProps {
    params: Promise<{
        token: string;
    }>;
}

export default async function InvitePage(props: PageProps) {
    const { token } = await props.params;

    const invitation = await getInvitationByToken(token);
    const validation = validateInvitationStatus(invitation);

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-6">
            <div className="relative z-10 w-full max-w-md">
                {/* Brand Logo Header */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/login" className="transition-opacity hover:opacity-90">
                        <BrandLogo size="xl" variant="full" textClassName="text-3xl" />
                    </Link>
                </div>

                {/* Valid Invitation Flow */}
                {validation.valid && invitation ? (
                    <div className="relative rounded-3xl bg-card border border-border shadow-2xl p-8 overflow-hidden">
                        {/* Top Badge */}
                        <div className="flex justify-center mb-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Undangan Terverifikasi
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="text-center space-y-2 mb-6">
                            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                                Bergabung dengan Taut
                            </h1>
                            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                                Anda telah menerima undangan resmi untuk mengakses ruang kerja Taut.
                            </p>
                        </div>

                        {/* Inviter Info Card */}
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/60 mb-6">
                            {invitation.invitedBy?.image ? (
                                <img
                                    src={invitation.invitedBy.image}
                                    alt={invitation.invitedBy.name || "Pengundang"}
                                    className="w-10 h-10 rounded-full border border-border object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                                    {(invitation.invitedBy?.name || "U")[0].toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1 text-left">
                                <p className="text-xs text-muted-foreground">Diundang oleh</p>
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {invitation.invitedBy?.name || invitation.invitedBy?.email || "Anggota Tim"}
                                </p>
                            </div>
                        </div>

                        {/* Invitation Metadata Info */}
                        <div className="space-y-2 mb-8 text-xs text-muted-foreground">
                            {invitation.email && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/40">
                                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>
                                        Khusus untuk: <strong className="text-foreground">{invitation.email}</strong>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/40">
                                <Users className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>
                                    {invitation.maxUses > 1
                                        ? `Sisa kuota: ${invitation.maxUses - invitation.usesCount} dari ${invitation.maxUses} penggunaan`
                                        : "Tautan sekali pakai (1 pengguna)"}
                                </span>
                            </div>

                            {invitation.expiresAt && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/40">
                                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>
                                        Berlaku hingga:{" "}
                                        <strong className="text-foreground">
                                            {format(new Date(invitation.expiresAt), "dd MMMM yyyy, HH:mm")}
                                        </strong>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Sign-in Action Button */}
                        <InviteAction token={token} />

                        <div className="mt-6 text-center text-xs text-muted-foreground">
                            Dengan masuk, Anda menyetujui<br />Syarat Layanan dan Kebijakan Privasi kami.
                        </div>
                    </div>
                ) : (
                    /* Invalid Invitation Flow */
                    <div className="relative rounded-3xl bg-card border border-border shadow-2xl p-8 overflow-hidden text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                            <AlertCircle className="w-6 h-6" />
                        </div>

                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground mb-2">
                            Undangan Tidak Dapat Digunakan
                        </h1>

                        <p className="font-sans text-sm text-muted-foreground mb-6 leading-relaxed">
                            {validation.message || "Tautan undangan tidak valid, telah kedaluwarsa, atau kuota penggunaan telah habis."}
                        </p>

                        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground mb-6 text-left">
                            <p className="font-medium text-foreground mb-1">Butuh akses ke Taut?</p>
                            <p>
                                Hubungi orang yang mengundang Anda untuk meminta tautan undangan baru atau verifikasi alamat email yang Anda gunakan.
                            </p>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full h-11 rounded-full font-medium"
                        >
                            <Link href="/login">
                                Kembali ke Halaman Masuk
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
