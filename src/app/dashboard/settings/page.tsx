import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight } from "lucide-react";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">Account</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Your account information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Name: </span>{session?.user?.name}
                    </p>
                    <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Email: </span>{session?.user?.email}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Manajemen Undangan</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Buat dan kelola tautan undangan untuk pengguna baru tanpa allowlist manual.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-2 border-t border-border/40">
                    <p className="text-sm text-muted-foreground">
                        Atur batas kuota, masa aktif, dan pantau akun yang telah mengklaim undangan.
                    </p>
                    <Button asChild className="bg-primary hover:bg-terracotta-active text-primary-foreground text-xs rounded-xl">
                        <Link href="/dashboard/invitations" className="flex items-center gap-1.5">
                            Buka Undangan <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

