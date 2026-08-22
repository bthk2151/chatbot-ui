import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
    const session = await auth();
    if (!session) redirect("/");

    const { user } = session;
    console.log(session);

    async function handleSignOut() {
        "use server";
        await signOut({ redirectTo: "/" });
    }

    return (
        <ChatClient
            user={{
                name: user!.name!,
                email: user!.email!,
                image: user?.image ?? null,
            }}
            signOutAction={handleSignOut}
        />
    );
}
