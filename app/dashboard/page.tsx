import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Image from "next/image";

export default async function DashboardPage() {
    const session = await auth();

    console.log(session);
    if (!session) redirect("/");

    const { user } = session;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                            <svg
                                className="h-4 w-4 text-white dark:text-zinc-900"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z"
                                />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            Chatbot
                        </span>
                    </div>

                    {/* Sign out */}
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign out
                        </button>
                    </form>
                </div>

                {/* User profile card */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 px-6 py-8">
                        <div className="flex items-center gap-4">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name ?? "User avatar"}
                                    width={64}
                                    height={64}
                                    className="rounded-full ring-2 ring-white dark:ring-zinc-900 shadow"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-zinc-300 dark:bg-zinc-600 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center text-2xl font-bold text-zinc-600 dark:text-zinc-300">
                                    {user?.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            )}
                            <div>
                                <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                    {user?.name ?? "—"}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {user?.email ?? "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Session fields */}
                    <div className="px-6 py-5 space-y-4">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            Session values
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            <Field label="Name" value={user?.name} />
                            <Field label="Email" value={user?.email} />
                            <Field label="User ID" value={user?.id} />
                        </div>
                    </div>
                </div>

                {/* Raw session JSON */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                        <svg
                            className="h-4 w-4 text-zinc-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                        </svg>
                        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            Raw session object
                        </span>
                    </div>
                    <pre className="overflow-x-auto px-6 py-5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-mono">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-start gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
            <span className="w-20 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500 pt-px">
                {label}
            </span>
            <span className="break-all text-sm text-zinc-800 dark:text-zinc-200 font-mono">
                {value ?? <span className="text-zinc-300 dark:text-zinc-600 italic">null</span>}
            </span>
        </div>
    );
}
