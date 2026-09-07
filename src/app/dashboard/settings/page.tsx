import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        </div>
    );
}
