import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

async function login(id: string, name: string) {
    const response = await fetch(`${process.env.API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`RAG API login failed with status ${response.status}`);
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ user }) {
            // Google always provides an email and name; bail out if either is missing.
            if (!user.email || !user.name) return false;

            await login(user.email, user.name);
            return true;
        },
    },
});
