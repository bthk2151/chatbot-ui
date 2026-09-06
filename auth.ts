import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createRagToken } from "@/lib/rag-token";

async function login(id: string, name: string) {
    const response = await fetch(`${process.env.API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await createRagToken(id, name)}`,
        },
        body: JSON.stringify({ id, name }),
        cache: "no-store",
        redirect: "error",
    });

    if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider !== "google" || profile?.email_verified !== true ||
                !user.email || !user.name || profile.email !== user.email) return false;

            await login(user.email, user.name);
            return true;
        },
        async jwt({ token, account, profile }) {
            // Existing sessions must reauthenticate before receiving backend tokens.
            if (account) {
                token.ragEmailVerified = account.provider === "google" &&
                    profile?.email_verified === true && profile.email === token.email;
            }
            // Returning null also clears old unverified sessions in Auth.js.
            return token.ragEmailVerified === true ? token : null;
        },
    },
});
