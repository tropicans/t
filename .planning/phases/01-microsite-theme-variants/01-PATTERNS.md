# Phase 01: microsite-theme-variants - Pattern Map

**Mapped:** 2026-06-26
**Files analyzed:** 6
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/microsite-themes.ts` | utility/config | transform | `src/components/microsite-page-client.tsx` + `src/lib/utils.ts` | partial-match |
| `src/app/actions/microsite.ts` | service/action | CRUD, request-response | `src/app/actions/microsite.ts` | exact |
| `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | component | CRUD, request-response | `src/app/dashboard/microsites/[id]/microsite-editor.tsx` | exact |
| `src/app/dashboard/microsites/new/page.tsx` | component/page | CRUD, request-response | `src/app/dashboard/microsites/new/page.tsx` | exact |
| `src/app/dashboard/microsites/page.tsx` | component/page | CRUD, request-response | `src/app/dashboard/microsites/page.tsx` | exact |
| `src/components/microsite-page-client.tsx` | component | polling/event-driven, request-response | `src/components/microsite-page-client.tsx` | exact |

## Pattern Assignments

### `src/lib/microsite-themes.ts` (utility/config, transform)

**Analog:** `src/components/microsite-page-client.tsx` for theme style object; `src/lib/utils.ts` for small lib export style.

**Imports pattern** (`src/lib/utils.ts` lines 1-2):
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
```

**Small utility export pattern** (`src/lib/utils.ts` lines 4-6):
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Core registry source pattern** (`src/components/microsite-page-client.tsx` lines 11-60):
```typescript
const themeStyles = {
    dark: {
        page: "bg-zinc-950",
        hero: "from-zinc-900/0 via-zinc-950/60 to-zinc-950",
        title: "text-white",
        description: "text-zinc-400",
        avatar: "border-zinc-800 ring-2 ring-zinc-700",
        card: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30",
        cardTitle: "text-white",
        icon: "text-zinc-600 group-hover:text-zinc-300",
        empty: "text-zinc-600",
        footer: "text-zinc-800",
        footerBrand: "text-zinc-600",
        divider: "bg-zinc-800",
        share: "text-zinc-500 hover:text-white",
        shareLabel: "text-zinc-600",
    },
    light: {
        page: "bg-gray-50",
        hero: "from-gray-50/0 via-gray-50/60 to-gray-50",
        title: "text-zinc-900",
        description: "text-zinc-500",
        avatar: "border-white ring-2 ring-zinc-200",
        card: "bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60",
        cardTitle: "text-zinc-900",
        icon: "text-zinc-400 group-hover:text-zinc-600",
        empty: "text-zinc-400",
        footer: "text-zinc-300",
        footerBrand: "text-zinc-400",
        divider: "bg-zinc-200",
        share: "text-zinc-400 hover:text-zinc-800",
        shareLabel: "text-zinc-400",
    },
    gradient: {
        page: "bg-gradient-to-b from-white to-[#8EC5E8]",
        hero: "from-white/0 via-white/35 to-[#8EC5E8]",
        title: "text-sky-950",
        description: "text-sky-900/75",
        avatar: "border-white/80 ring-2 ring-sky-200/80",
        card: "bg-white/55 border border-white/70 text-sky-950 hover:bg-white/75 hover:border-white/90 backdrop-blur-md hover:shadow-lg hover:shadow-sky-300/30",
        cardTitle: "text-sky-950",
        icon: "text-sky-900/40 group-hover:text-sky-900/70",
        empty: "text-sky-900/45",
        footer: "text-sky-950/20",
        footerBrand: "text-sky-950/45",
        divider: "bg-sky-900/12",
        share: "text-sky-900/45 hover:text-sky-950",
        shareLabel: "text-sky-900/40",
    },
} as const;
```

**Fallback helper pattern to move into registry** (`src/components/microsite-page-client.tsx` line 163):
```typescript
const styles = themeStyles[microsite.theme as keyof typeof themeStyles] ?? themeStyles.dark;
```

**Copy requirement:** Preserve existing `dark`, `light`, and `gradient` public class strings byte-for-byte from lines 11-60.

---

### `src/app/actions/microsite.ts` (service/action, CRUD + request-response)

**Analog:** `src/app/actions/microsite.ts`

**Imports pattern** (lines 1-7):
```typescript
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isGlobalDashboardViewer } from "@/lib/microsite-access";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
```

**Auth/access guard pattern** (lines 16-36):
```typescript
async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Unauthorized");

    return {
        userId: user.id,
        canManageAllMicrosites: isGlobalDashboardViewer(session.user.email),
    };
}

async function getEditableMicrosite(id: string, access: CurrentUserAccess) {
    const microsite = await prisma.microsite.findUnique({ where: { id } });
    if (!microsite || (!access.canManageAllMicrosites && microsite.userId !== access.userId)) {
        throw new Error("Not found");
    }

    return microsite;
}
```

**Validation pattern** (lines 51-59):
```typescript
function validateSlug(slug: string): string {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!clean || clean.length < 2) throw new Error("Slug must be at least 2 characters");
    if (clean.length > 60) throw new Error("Slug must be under 60 characters");
    // Reserved routes
    const reserved = ["dashboard", "login", "api", "l", "_next", "favicon.ico"];
    if (reserved.includes(clean)) throw new Error(`"${clean}" is a reserved slug`);
    return clean;
}
```

**Create CRUD pattern** (lines 63-82):
```typescript
export async function createMicrosite(formData: FormData) {
    const { userId } = await getCurrentUserAccess();
    const slug = validateSlug(formData.get("slug") as string);
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const theme = (formData.get("theme") as string) || "dark";
    const coverImage = (formData.get("coverImage") as string)?.trim() || null;
    const avatarImage = (formData.get("avatarImage") as string)?.trim() || null;

    if (!title) throw new Error("Title is required");

    const existing = await prisma.microsite.findUnique({ where: { slug } });
    if (existing) throw new Error(`The slug "${slug}" is already taken`);

    const microsite = await prisma.microsite.create({
        data: { slug, title, description, theme, userId, coverImage, avatarImage },
    });

    revalidatePath("/dashboard/microsites");
    return { success: true, microsite };
}
```

**Update CRUD + revalidation pattern** (lines 85-105):
```typescript
export async function updateMicrosite(id: string, formData: FormData) {
    const access = await getCurrentUserAccess();
    const microsite = await getEditableMicrosite(id, access);

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const theme = (formData.get("theme") as string) || microsite.theme;
    const isPublished = formData.get("isPublished") === "true";
    const coverImageRaw = (formData.get("coverImage") as string)?.trim();
    const coverImage = coverImageRaw || null;
    const avatarImageRaw = (formData.get("avatarImage") as string)?.trim();
    const avatarImage = avatarImageRaw || null;

    const updated = await prisma.microsite.update({
        where: { id },
        data: { title, description, theme, isPublished, coverImage, avatarImage },
    });

    revalidatePath(`/dashboard/microsites/${id}`);
    revalidatePath(`/${updated.slug}`);
    return { success: true, microsite: updated };
}
```

**Pattern assignment:** Import `normalizeMicrositeTheme` after local imports. Replace raw theme extraction on lines 68 and 91 with normalization. Keep access checks and `revalidatePath` order.

---

### `src/app/dashboard/microsites/[id]/microsite-editor.tsx` (component, CRUD + request-response)

**Analog:** `src/app/dashboard/microsites/[id]/microsite-editor.tsx`

**Imports pattern** (lines 1-21):
```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    updateMicrosite,
    deleteMicrosite,
    createMicrositeLink,
    updateMicrositeLink,
    deleteMicrositeLink,
} from "@/app/actions/microsite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, ExternalLink, Trash2, Pencil, Loader2, Eye, EyeOff, Globe } from "lucide-react";
import { CoverImageUploader } from "@/components/cover-image-uploader";
import { AvatarImageUploader } from "@/components/avatar-image-uploader";
import Link from "next/link";
```

**Client state + fallback pattern to replace** (lines 57-65):
```typescript
export function MicrositeEditor({ microsite }: { microsite: MicrositeWithLinks }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editLinkId, setEditLinkId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState(microsite.theme || "dark");
    const [coverImageUrl, setCoverImageUrl] = useState(microsite.coverImage || "");
    const [avatarImageUrl, setAvatarImageUrl] = useState(microsite.avatarImage || "");
```

**Local theme array to delete/replace** (lines 67-92):
```typescript
    const THEMES = [
        {
            id: "dark",
            label: "Dark",
            bg: "bg-zinc-950",
            preview: "bg-gradient-to-b from-zinc-900 to-zinc-950",
            cardBg: "bg-zinc-800",
            dot: "bg-zinc-400",
        },
        {
            id: "light",
            label: "Light",
            bg: "bg-gray-100",
            preview: "bg-gradient-to-b from-white to-gray-100",
            cardBg: "bg-white border border-gray-200",
            dot: "bg-gray-400",
        },
        {
            id: "gradient",
            label: "Gradient",
            bg: "bg-[#8EC5E8]",
            preview: "bg-gradient-to-b from-white to-[#8EC5E8]",
            cardBg: "bg-white/70 border border-white/80",
            dot: "bg-sky-300",
        },
    ];
```

**Submit/update error pattern** (lines 94-107):
```typescript
    function handleUpdateInfo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await updateMicrosite(microsite.id, formData);
                router.refresh();
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }
```

**Theme picker grid pattern** (lines 257-286):
```tsx
                        {/* Theme picker */}
                        <input type="hidden" name="theme" value={selectedTheme} />
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Tema Tampilan</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedTheme(t.id)}
                                        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedTheme === t.id
                                            ? "border-blue-500 shadow-lg shadow-blue-500/20"
                                            : "border-zinc-700 hover:border-zinc-500"
                                            }`}
                                    >
                                        {/* Mini preview */}
                                        <div className={`h-20 w-full ${t.preview} flex flex-col items-center justify-center gap-1.5 p-2`}>
                                            <div className={`w-6 h-6 rounded-full ${t.dot} opacity-80`} />
                                            <div className={`h-2 w-12 rounded-full ${t.cardBg} opacity-70`} />
                                            <div className={`h-2 w-10 rounded-full ${t.cardBg} opacity-50`} />
                                        </div>
                                        <div className={`py-1.5 text-center text-xs font-medium ${selectedTheme === t.id ? "text-blue-400" : "text-zinc-400"
                                            } ${t.bg}`}>
                                            {t.label}
                                            {selectedTheme === t.id && " ✓"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
```

**Pattern assignment:** Replace local `THEMES` with `MICROSITE_THEMES`. Initialize state with `normalizeMicrositeTheme(microsite.theme)`. Keep `grid grid-cols-3 gap-3`, border + checkmark selection, `useTransition`, `router.refresh()`, `getErrorMessage`.

---

### `src/app/dashboard/microsites/new/page.tsx` (component/page, CRUD + request-response)

**Analog:** `src/app/dashboard/microsites/new/page.tsx`

**Imports pattern** (lines 1-14):
```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMicrosite } from "@/app/actions/microsite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CoverImageUploader } from "@/components/cover-image-uploader";
import { AvatarImageUploader } from "@/components/avatar-image-uploader";
```

**Local theme array to replace** (lines 16-20):
```typescript
const THEMES = [
    { value: "dark", label: "Dark", bg: "bg-zinc-900", text: "Gelap elegan" },
    { value: "light", label: "Light", bg: "bg-white", text: "Terang bersih" },
    { value: "gradient", label: "Gradient", bg: "bg-gradient-to-b from-white to-[#8EC5E8]", text: "Putih ke biru lembut" },
];
```

**Submit pattern** (lines 40-56):
```typescript
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        formData.set("theme", selectedTheme);

        startTransition(async () => {
            try {
                const result = await createMicrosite(formData);
                if (result.success) {
                    router.push(`/dashboard/microsites/${result.microsite.id}`);
                }
            } catch (err) {
                setError(getErrorMessage(err));
            }
        });
    }
```

**Current picker pattern** (lines 145-169):
```tsx
                <Card className="bg-zinc-900/60 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Tema</CardTitle>
                        <CardDescription className="text-zinc-500">Pilih tampilan halaman publikmu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.value}
                                    type="button"
                                    onClick={() => setSelectedTheme(theme.value)}
                                    className={`rounded-xl p-3 border-2 transition-all text-left ${selectedTheme === theme.value
                                        ? "border-blue-500"
                                        : "border-zinc-800 hover:border-zinc-600"
                                        }`}
                                >
                                    <div className={`w-full h-12 rounded-lg mb-2 ${theme.bg}`} />
                                    <p className="text-xs font-medium text-white">{theme.label}</p>
                                    <p className="text-xs text-zinc-500">{theme.text}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
```

**Pattern assignment:** Use same registry-powered mini preview markup as editor for create page. Keep `formData.set("theme", selectedTheme)`, transition, error display, `router.push` after create.

---

### `src/app/dashboard/microsites/page.tsx` (component/page, CRUD + request-response)

**Analog:** `src/app/dashboard/microsites/page.tsx`

**Imports/auth pattern** (lines 1-18):
```typescript
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isGlobalMicrositeViewer } from "@/lib/microsite-access";
import {
    Plus,
    ExternalLink,
    PlusCircle,
    Eye,
    EyeOff,
    Link2,
    Layers,
} from "lucide-react";
```

**Thumbnail component pattern to replace with registry metadata** (lines 20-52):
```tsx
// Pick a thumbnail icon based on the microsite's theme
function ThemeThumbnail({ theme, title }: { theme: string; title: string }) {
    const initial = title.charAt(0).toUpperCase();

    if (theme === "gradient") {
        return (
            <div className="h-32 w-full rounded-xl mb-4 bg-gradient-to-b from-white to-[#8EC5E8] flex items-center justify-center overflow-hidden transition-all group-hover:brightness-95">
                <div className="bg-white/80 rounded-2xl w-14 h-14 flex items-center justify-center text-sky-950 text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm">
                    {initial}
                </div>
            </div>
        );
    }

    if (theme === "light") {
        return (
            <div className="h-32 w-full rounded-xl mb-4 bg-slate-100 dark:bg-zinc-800/40 flex items-center justify-center overflow-hidden group-hover:bg-zinc-800/60 transition-all">
                <div className="bg-white dark:bg-zinc-700 rounded-2xl w-14 h-14 flex items-center justify-center text-zinc-800 dark:text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                    {initial}
                </div>
            </div>
        );
    }

    // dark (default)
    return (
        <div className="h-32 w-full rounded-xl mb-4 bg-zinc-800/50 flex items-center justify-center overflow-hidden group-hover:bg-zinc-800/80 transition-all">
            <div className="bg-zinc-800 rounded-2xl w-14 h-14 flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                {initial}
            </div>
        </div>
    );
}
```

**Server session + Prisma query pattern** (lines 54-70):
```typescript
export default async function MicrositesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) redirect("/login");

    const canViewAllMicrosites = isGlobalMicrositeViewer(session.user.email);

    const microsites = await prisma.microsite.findMany({
        where: canViewAllMicrosites ? undefined : { userId: dbUser.id },
        include: {
            _count: { select: { links: true, clicks: true } },
            user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });
```

**Usage seam** (lines 116-118):
```tsx
                                    {/* Thumbnail */}
                                    <ThemeThumbnail theme={ms.theme} title={ms.title} />
```

**Pattern assignment:** Keep server component, auth redirect, Prisma include/order. Replace if-chain with `getMicrositeTheme(theme).thumbnail` classes. Keep default dark fallback through registry.

---

### `src/components/microsite-page-client.tsx` (component, polling/event-driven + request-response)

**Analog:** `src/components/microsite-page-client.tsx`

**Imports pattern** (lines 1-7):
```typescript
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ShareBar } from "@/components/share-bar";
import type { PublicMicrositeData } from "@/lib/public-microsite";
```

**Polling change detector pattern** (lines 62-80):
```typescript
function hasMicrositeChanged(current: PublicMicrositeData, next: PublicMicrositeData) {
    if (
        current.title !== next.title ||
        current.description !== next.description ||
        current.theme !== next.theme ||
        current.coverImage !== next.coverImage ||
        current.avatarImage !== next.avatarImage ||
        current.user.name !== next.user.name ||
        current.user.image !== next.user.image ||
        current.links.length !== next.links.length
    ) {
        return true;
    }

    return current.links.some((link, index) => {
        const nextLink = next.links[index];
        return link.id !== nextLink.id || link.title !== nextLink.title;
    });
}
```

**Fetch/polling error handling pattern** (lines 92-161):
```typescript
    useEffect(() => {
        let disposed = false;
        let timeoutId: number | undefined;

        const syncMicrosite = async () => {
            if (disposed || document.visibilityState === "hidden" || requestInFlightRef.current) {
                return;
            }

            requestInFlightRef.current = true;

            try {
                const response = await fetch(
                    `/api/microsites/${encodeURIComponent(initialMicrosite.slug)}?ts=${Date.now()}`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const nextMicrosite = (await response.json()) as PublicMicrositeData;

                startTransition(() => {
                    setMicrosite((currentMicrosite) =>
                        hasMicrositeChanged(currentMicrosite, nextMicrosite) ? nextMicrosite : currentMicrosite
                    );
                });
            } catch {
                // Ignore transient polling failures and try again on the next cycle.
            } finally {
                requestInFlightRef.current = false;
            }
        };
```

**Current fallback seam** (line 163):
```typescript
    const styles = themeStyles[microsite.theme as keyof typeof themeStyles] ?? themeStyles.dark;
```

**Render class usage pattern** (lines 167-177):
```tsx
        <div className={`min-h-screen ${styles.page}`}>
            {hasCover ? (
                <div className="relative w-full h-52 sm:h-64">
                    <Image
                        src={microsite.coverImage!}
                        alt={microsite.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b ${styles.hero}`} />
```

**Card + ShareBar usage pattern** (lines 225-247):
```tsx
                            microsite.links.map((link, index) => (
                                <a
                                    key={link.id}
                                    href={`/api/click/microsite-link/${link.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group animate-in fade-in slide-in-from-bottom-4 ${styles.card}`}
                                    style={{ animationDelay: `${(index + 1) * 70}ms`, animationFillMode: "both" }}
                                >
                                    <span className={`font-medium text-[15px] ${styles.cardTitle}`}>{link.title}</span>
                                    <ExternalLink className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${styles.icon}`} />
                                </a>
                            ))
```
```tsx
                    <ShareBar
                        title={microsite.title}
                        pageUrl={pageUrl}
                        shareClass={styles.share}
                        labelClass={styles.shareLabel}
                        dividerClass={styles.divider}
                    />
```

**Pattern assignment:** Remove local `themeStyles`; import `getMicrositeTheme`; use `const styles = getMicrositeTheme(microsite.theme).public;`. Keep polling, transient failure swallow, class application unchanged.

---

## Shared Patterns

### Authentication / Authorization
**Source:** `src/app/actions/microsite.ts` lines 16-36 and `src/app/dashboard/microsites/page.tsx` lines 54-61  
**Apply to:** `src/app/actions/microsite.ts`, `src/app/dashboard/microsites/page.tsx`

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) redirect("/login");

const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
if (!dbUser) redirect("/login");
```

```typescript
const microsite = await prisma.microsite.findUnique({ where: { id } });
if (!microsite || (!access.canManageAllMicrosites && microsite.userId !== access.userId)) {
    throw new Error("Not found");
}
```

### Server Action Error Handling
**Source:** `src/app/actions/microsite.ts` lines 18-21, 53-57, 72-75  
**Apply to:** `src/app/actions/microsite.ts`

```typescript
if (!session?.user?.email) throw new Error("Unauthorized");
if (!user) throw new Error("Unauthorized");
if (!title) throw new Error("Title is required");
if (existing) throw new Error(`The slug "${slug}" is already taken`);
```

### Client Form Error Handling
**Source:** `src/app/dashboard/microsites/[id]/microsite-editor.tsx` lines 53-55, 94-107; `src/app/dashboard/microsites/new/page.tsx` lines 22-24, 40-56  
**Apply to:** editor and create page

```typescript
function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Terjadi kesalahan tak terduga";
}
```

```typescript
try {
    await updateMicrosite(microsite.id, formData);
    router.refresh();
} catch (err) {
    setError(getErrorMessage(err));
}
```

### Theme Fallback
**Source:** `src/components/microsite-page-client.tsx` line 163; research registry pattern lines 197-240  
**Apply to:** registry, server actions, editor state, public renderer, thumbnails

```typescript
const styles = themeStyles[microsite.theme as keyof typeof themeStyles] ?? themeStyles.dark;
```

Planner should convert this into:
```typescript
export const DEFAULT_MICROSITE_THEME_ID = "dark";
export function getMicrositeTheme(value: string) {
    return MICROSITE_THEMES.find((theme) => theme.id === value) ?? MICROSITE_THEMES[0];
}
```

### Literal Tailwind Classes
**Source:** `src/components/microsite-page-client.tsx` lines 11-60, `src/app/dashboard/microsites/[id]/microsite-editor.tsx` lines 67-92  
**Apply to:** all registry public/preview/thumbnail style objects

```typescript
card: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30",
```

Do not build classes like `bg-${color}-900`.

### Revalidation After Mutations
**Source:** `src/app/actions/microsite.ts` lines 81, 103-105, 139-140, 157-158  
**Apply to:** server action edits only

```typescript
revalidatePath("/dashboard/microsites");
```

```typescript
revalidatePath(`/dashboard/microsites/${id}`);
revalidatePath(`/${updated.slug}`);
return { success: true, microsite: updated };
```

## No Analog Found

None. New registry has partial analogs from existing local theme maps and small `src/lib` helper style.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|

## Metadata

**Analog search scope:** `src/app/dashboard/microsites/**/*.tsx`, `src/components/**/*.tsx`, `src/app/actions/**/*.ts`, `src/lib/**/*.ts`; grep for `THEMES`, `themeStyles`, `ThemeThumbnail`.  
**Files scanned:** 13 direct candidates; 6 analogs read.  
**Pattern extraction date:** 2026-06-26
