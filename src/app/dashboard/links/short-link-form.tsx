"use client";

import { useTransition, useRef, useState } from "react";
import { createShortLink } from "@/app/actions/short";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LinkIcon, Lock, Wand2 } from "lucide-react";

export function ShortLinkForm() {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

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
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
                <form ref={formRef} action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="originalUrl" className="text-zinc-300">Destination URL</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                id="originalUrl"
                                name="originalUrl"
                                type="url"
                                placeholder="https://example.com/very/long/url..."
                                required
                                className="pl-9 bg-zinc-950 border-zinc-800 text-white focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customAlias" className="text-zinc-300">Custom Alias (Optional)</Label>
                            <div className="flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-400 sm:text-sm whitespace-nowrap">
                                    {(process.env.NEXT_PUBLIC_APP_URL ?? "localhost:4000").replace(/^https?:\/\//, "")}/
                                </span>
                                <Input
                                    type="text"
                                    name="customAlias"
                                    id="customAlias"
                                    className="rounded-l-none bg-zinc-950 border-zinc-700 text-white"
                                    placeholder="my-link"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">Password Protection (Optional)</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Leave empty for public link"
                                    className="pl-9 bg-zinc-950 border-zinc-800 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        >
                            {isPending ? "Shortening..." : <><Wand2 className="w-4 h-4 mr-2" /> Shorten URL</>}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
