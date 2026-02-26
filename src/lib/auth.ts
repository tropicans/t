import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

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

                // Restrict login to allowed emails if ALLOWED_EMAILS is provided
                const allowedEmailsStr = process.env.ALLOWED_EMAILS;
                if (allowedEmailsStr) {
                    const allowedEmails = allowedEmailsStr.split(",").map(e => e.trim().toLowerCase());
                    const userEmail = user.email.toLowerCase();
                    if (!allowedEmails.includes(userEmail)) {
                        console.log(`[AUTH] Blocked unauthorized login attempt from: ${userEmail}`);
                        return false;
                    }
                }

                try {
                    // Upsert: create user if not exists, or update name/image if already exists
                    await prisma.user.upsert({
                        where: { email: user.email },
                        create: {
                            email: user.email,
                            name: user.name || "User",
                            image: user.image || "",
                        },
                        update: {
                            name: user.name || undefined,
                            image: user.image || undefined,
                        },
                    });
                    return true;
                } catch (error: any) {
                    console.error("SignIn DB Error:", error?.message || error);
                    // Allow sign-in even if DB upsert fails (degraded mode)
                    return true;
                }
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
