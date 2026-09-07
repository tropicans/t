"use client";

import { useTransition, useRef, useState, useSyncExternalStore } from "react";
import { createShortLink } from "@/app/actions/short";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LinkIcon, Lock, Wand2 } from "lucide-react";

const emptySubscribe = () => () => {};

export function ShortLinkForm() {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const displayDomain = useSyncExternalStore(emptySubscribe, () => window.location.host, () => "");

    async function action(formData: FormData) {
        setErrorMsg("");
        startTransition(async () => {
            const res = await createShortLink(formData);
            if (res.error) {
                setErrorMsg(res.error);
            } else {
                formRef.current?.reset();
            }
        });
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form ref={formRef} action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="originalUrl" className="text-foreground font-medium">Destination URL</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="originalUrl"
                                name="originalUrl"
                                type="url"
                                placeholder="https://example.com/very/long/url..."
                                required
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customAlias" className="text-foreground font-medium">Custom Alias (Optional)</Label>
                            <div className="flex rounded-md shadow-xs">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground sm:text-sm whitespace-nowrap">
                                    {displayDomain || (process.env.NEXT_PUBLIC_APP_URL ?? "localhost:4000").replace(/^https?:\/\//, "")}/
                                </span>
                                <Input
                                    type="text"
                                    name="customAlias"
                                    id="customAlias"
                                    className="rounded-l-none"
                                    placeholder="my-link"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground font-medium">Password Protection (Optional)</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Leave empty for public link"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto"
                        >
                            {isPending ? "Shortening..." : <><Wand2 className="w-4 h-4 mr-2" /> Shorten URL</>}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
