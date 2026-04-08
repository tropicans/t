import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGlobalDashboardViewer } from "@/lib/microsite-access";
import { ShortLinkForm } from "./short-link-form";
import { ShortLinkList } from "./short-link-list";

export default async function ShortLinksPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return null;
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) {
        return null;
    }

    const canViewAllLinks = isGlobalDashboardViewer(session.user.email);
    const links = await prisma.shortLink.findMany({
        where: canViewAllLinks ? undefined : { userId: dbUser.id },
        include: {
            user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Short Links</h1>
                <p className="text-zinc-400">
                    Create, manage, and track your shortened URLs.
                </p>
            </div>

            <ShortLinkForm />

            <div className="pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                    {canViewAllLinks ? "All Links" : "Your Links"}
                </h2>
                {links.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl">
                        <p className="text-zinc-400">No short links yet. Create one above!</p>
                    </div>
                ) : (
                    <ShortLinkList
                        initialLinks={links}
                        viewerUserId={dbUser.id}
                        canViewAllLinks={canViewAllLinks}
                    />
                )}
            </div>
        </div>
    );
}
