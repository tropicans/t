"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* Immersive Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-6">
                {/* Brand Logo Header */}
                <div className="flex flex-col items-center mb-10 space-y-4">
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-xl shadow-blue-500/20">
                        <div className="absolute inset-0 rounded-2xl border border-white/20" />
                        <LinkIcon className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Main Login Card */}
                <div className="relative rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 shadow-2xl p-8 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome to Taut</h1>
                        <p className="text-sm text-zinc-400">
                            Masuk untuk mulai mengelola Shortened URLs dan Microsites Anda.
                        </p>
                    </div>

                    {searchParams.get("error") === "AccessDenied" && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-sm font-medium text-red-400">
                                Akses Ditolak
                            </p>
                            <p className="text-xs text-red-400/80 mt-1">
                                Email Anda tidak memiliki izin untuk masuk ke sistem ini.
                            </p>
                        </div>
                    )}

                    <Button
                        className="relative group w-full h-12 bg-white hover:bg-zinc-100 text-black font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-white/5 overflow-hidden"
                        onClick={() => signIn("google", { callbackUrl })}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-3">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                                <path
                                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                                    fill="#EA4335"
                                />
                                <path
                                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                                    fill="#34A853"
                                />
                            </svg>
                            Continue with Google
                        </span>
                    </Button>

                    <div className="mt-8 text-center text-xs text-zinc-500">
                        Dengan masuk, Anda menyetujui<br />Syarat Layanan dan Kebijakan Privasi kami.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
