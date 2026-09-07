import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getInvitationByToken, validateInvitationStatus } from "./invitations";

export interface AuthorizeSignInInput {
    email: string;
    name?: string | null;
    image?: string | null;
    inviteToken?: string | null;
}

export interface AuthorizeSignInResult {
    allowed: boolean;
    reason?: "EXISTING_USER" | "ALLOWED_EMAILS" | "INVITATION_CLAIMED" | "UNAUTHORIZED" | "INVALID_INVITATION" | "ERROR";
    user?: {
        id: string;
        email: string | null;
        name: string | null;
    };
    errorMessage?: string;
}

/**
 * Core authorization logic for user sign-in.
 * Tier 1: Existing registered user in DB (AUTH-02)
 * Tier 2: Superadmin allowlist in ALLOWED_EMAILS (AUTH-02)
 * Tier 3: Valid invitation token claim in transaction (AUTH-01)
 */
export async function authorizeUserSignIn({
    email,
    name,
    image,
    inviteToken,
}: AuthorizeSignInInput): Promise<AuthorizeSignInResult> {
    if (!email) {
        return { allowed: false, reason: "UNAUTHORIZED", errorMessage: "Email is required" };
    }

    const userEmail = email.trim().toLowerCase();

    // 1. Existing registered user check (AUTH-02)
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        if (existingUser) {
            // Update profile info if provided
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    name: name || undefined,
                    image: image || undefined,
                },
            });
            return {
                allowed: true,
                reason: "EXISTING_USER",
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.name,
                },
            };
        }
    } catch (error) {
        console.error("[AUTH] Error querying existing user:", error);
    }

    // 2. Superadmin bootstrap allowlist check (AUTH-02)
    const allowedEmailsStr = process.env.ALLOWED_EMAILS;
    let isAllowlisted = false;
    if (allowedEmailsStr) {
        const allowedEmails = allowedEmailsStr.split(",").map((e) => e.trim().toLowerCase());
        if (allowedEmails.includes(userEmail)) {
            isAllowlisted = true;
        }
    }

    if (isAllowlisted) {
        try {
            const createdUser = await prisma.user.upsert({
                where: { email: userEmail },
                create: {
                    email: userEmail,
                    name: name || "User",
                    image: image || "",
                },
                update: {
                    name: name || undefined,
                    image: image || undefined,
                },
            });
            return {
                allowed: true,
                reason: "ALLOWED_EMAILS",
                user: {
                    id: createdUser.id,
                    email: createdUser.email,
                    name: createdUser.name,
                },
            };
        } catch (error) {
            console.error("[AUTH] Error creating bootstrap user:", error);
            // In degraded mode allow if allowlisted
            return { allowed: true, reason: "ALLOWED_EMAILS" };
        }
    }

    // 3. Invitation token claim check (AUTH-01)
    if (inviteToken) {
        try {
            const invitation = await getInvitationByToken(inviteToken);
            const validation = validateInvitationStatus(invitation, userEmail);

            if (validation.valid && invitation) {
                // Execute atomic transaction to claim invitation and create user
                const result = await prisma.$transaction(async (tx) => {
                    const newUsesCount = invitation.usesCount + 1;
                    const newStatus = newUsesCount >= invitation.maxUses ? "ACCEPTED" : "PENDING";

                    await tx.invitation.update({
                        where: { id: invitation.id },
                        data: {
                            usesCount: newUsesCount,
                            status: newStatus,
                        },
                    });

                    const newUser = await tx.user.create({
                        data: {
                            email: userEmail,
                            name: name || "User",
                            image: image || "",
                            invitationId: invitation.id,
                        },
                    });

                    return newUser;
                });

                return {
                    allowed: true,
                    reason: "INVITATION_CLAIMED",
                    user: {
                        id: result.id,
                        email: result.email,
                        name: result.name,
                    },
                };
            } else {
                console.log(`[AUTH] Invalid invitation token for ${userEmail}:`, validation.reason);
                return {
                    allowed: false,
                    reason: "INVALID_INVITATION",
                    errorMessage: validation.message,
                };
            }
        } catch (error) {
            console.error("[AUTH] Error claiming invitation:", error);
            return {
                allowed: false,
                reason: "ERROR",
                errorMessage: error instanceof Error ? error.message : String(error),
            };
        }
    }

    // 4. Default: deny unauthorized user
    console.log(`[AUTH] Blocked unauthorized login attempt from: ${userEmail}`);
    return {
        allowed: false,
        reason: "UNAUTHORIZED",
        errorMessage: "Email Anda tidak memiliki izin untuk masuk ke sistem ini.",
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                if (!user.email) return false;

                let inviteToken: string | null = null;
                try {
                    const cookieStore = await cookies();
                    inviteToken = cookieStore.get("taut_invite_token")?.value || null;
                } catch {
                    // Context might not provide cookies in certain non-request environments
                }

                const authResult = await authorizeUserSignIn({
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    inviteToken,
                });

                if (authResult.allowed && inviteToken) {
                    try {
                        const cookieStore = await cookies();
                        cookieStore.delete("taut_invite_token");
                    } catch {
                        // Ignore cookie deletion failure
                    }
                }

                return authResult.allowed;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user?.email) {
                try {
                    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
                    if (dbUser) {
                        token.id = dbUser.id;
                    }
                } catch {
                    // Catch DB errors
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};
