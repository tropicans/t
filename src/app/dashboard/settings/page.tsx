import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                <p className="text-zinc-400">
                    Manage your account settings and profile preferences.
                </p>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Account</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Your account information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-zinc-300">
                        <span className="text-zinc-500">Name: </span>{session?.user?.name}
                    </p>
                    <p className="text-sm text-zinc-300">
                        <span className="text-zinc-500">Email: </span>{session?.user?.email}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
