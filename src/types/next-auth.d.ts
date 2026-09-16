import { DefaultSession } from "next-auth";

export type UserRole = "ADMIN" | "OPERATOR" | "MEMBER";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isAdmin?: boolean;
            isOperator?: boolean;
            role?: UserRole;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isAdmin?: boolean;
        isOperator?: boolean;
        role?: UserRole;
    }
}

