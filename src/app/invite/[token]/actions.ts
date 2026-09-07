"use server";

import { cookies } from "next/headers";

/**
 * Stores the invitation token securely in an HTTP-only session cookie
 * prior to initiating OAuth redirection.
 */
export async function setInvitationCookie(token: string): Promise<{ success: boolean }> {
    if (!token) {
        return { success: false };
    }

    try {
        const cookieStore = await cookies();
        cookieStore.set("taut_invite_token", token.trim(), {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600, // 1 hour validity for the claim window
        });
        return { success: true };
    } catch (error) {
        console.error("Error setting invitation cookie:", error);
        return { success: false };
    }
}

/**
 * Clears the invitation cookie if present.
 */
export async function clearInvitationCookie(): Promise<{ success: boolean }> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("taut_invite_token");
        return { success: true };
    } catch (error) {
        console.error("Error clearing invitation cookie:", error);
        return { success: false };
    }
}
