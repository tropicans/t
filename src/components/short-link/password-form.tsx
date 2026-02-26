"use client";

import { useTransition } from "react";
import { verifyPasswordAndRedirect } from "@/app/actions/short-link-redirect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

export function PasswordForm({ shortCode, error }: { shortCode: string; error?: string }) {
    const [isPending, startTransition] = useTransition();

    async function action(formData: FormData) {
        startTransition(async () => {
            await verifyPasswordAndRedirect(shortCode, formData);
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-zinc-400" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Protected Link</CardTitle>
                    <CardDescription className="text-zinc-400">
                        This link requires a password to access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <Input
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            required
                            className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-blue-500 h-11"
                        />
                        {error && (
                            <p className="text-sm text-red-500 text-center bg-red-500/10 p-2 rounded-md">
                                {error}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                        >
                            {isPending ? "Verifying..." : (
                                <>Unlock Link <ArrowRight className="w-4 h-4 ml-2" /></>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
