"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────

type Attachment = {
    id: string;
    name: string;
    size: number;
    type: string;
};

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    attachments: Attachment[];
    timestamp: Date;
};

type UserProps = {
    name: string | null;
    email: string | null;
    image: string | null;
};

type Props = {
    user: UserProps;
    signOutAction: () => Promise<void>;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Profile card (top-right dropdown) ─────────────────────────────────────

function ProfileCard({
    user,
    signOutAction,
}: {
    user: UserProps;
    signOutAction: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const displayName = user.name ?? "You";
    const initials = displayName[0]?.toUpperCase() ?? "?";

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            {/* Toggle button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-white dark:ring-zinc-700 shadow"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {initials}
                    </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {displayName}
                </span>
                <svg
                    className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown card — reuses the profile card style from the original dashboard */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-xl overflow-hidden z-50">
                    <div className="bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 px-6 py-5">
                        <div className="flex items-center gap-4">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={displayName}
                                    width={56}
                                    height={56}
                                    className="rounded-full ring-2 ring-white dark:ring-zinc-900 shadow"
                                />
                            ) : (
                                <div className="h-14 w-14 rounded-full bg-zinc-300 dark:bg-zinc-600 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center text-xl font-bold text-zinc-600 dark:text-zinc-300">
                                    {initials}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                                    {displayName}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                                    {user.email ?? "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3">
                        <form action={signOutAction}>
                            <button
                                type="submit"
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                </div>
            )}
        </div>
    );
}

// ── Chat bubble ────────────────────────────────────────────────────────────

function ChatBubble({ message, user }: { message: Message; user: UserProps }) {
    const isUser = message.role === "user";
    const displayName = user.name ?? "You";
    const initials = displayName[0]?.toUpperCase() ?? "?";

    return (
        <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            {isUser ? (
                user.image ? (
                    <Image
                        src={user.image}
                        alt={displayName}
                        width={34}
                        height={34}
                        className="rounded-full ring-2 ring-white dark:ring-zinc-700 shadow shrink-0"
                    />
                ) : (
                    <div className="h-[34px] w-[34px] shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600 ring-2 ring-white dark:ring-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {initials}
                    </div>
                )
            ) : (
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white shadow">
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
            )}

            {/* Bubble + meta */}
            <div className={`flex flex-col max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                {/* Sender name */}
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 px-1">
                    {isUser ? displayName : "Chatbot"}
                </span>

                {/* Bubble — WhatsApp-inspired asymmetric corner */}
                <div
                    className={`
                        px-4 py-2.5 shadow-sm
                        ${isUser
                            ? "bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl rounded-tr-sm"
                            : "bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm"
                        }
                    `}
                >
                    {message.content && (
                        <p className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </p>
                    )}

                    {/* Attached files */}
                    {message.attachments.length > 0 && (
                        <div className={`flex flex-col gap-1.5 ${message.content ? "mt-2" : ""}`}>
                            {message.attachments.map((att) => (
                                <div
                                    key={att.id}
                                    className="flex items-center gap-2 rounded-lg bg-black/5 dark:bg-white/10 px-3 py-2"
                                >
                                    <svg
                                        className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                        />
                                    </svg>
                                    <span className="truncate max-w-[180px] text-xs text-zinc-700 dark:text-zinc-300">
                                        {att.name}
                                    </span>
                                    <span className="shrink-0 text-xs text-zinc-400">
                                        {formatBytes(att.size)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <span suppressHydrationWarning className="text-[10px] text-zinc-400 mt-1 px-1">
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ChatClient({ user, signOutAction }: Props) {
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: "welcome",
            role: "assistant",
            content: `Hi${user.name ? ", " + user.name.split(" ")[0] : ""}! 👋 I'm your AI assistant. How can I help you today? You can also attach files to your messages.`,
            attachments: [],
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setPendingFiles((prev) => [...prev, ...files]);
        e.target.value = "";
    }

    function removePendingFile(idx: number) {
        setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed && pendingFiles.length === 0) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
            attachments: pendingFiles.map((f) => ({
                id: crypto.randomUUID(),
                name: f.name,
                size: f.size,
                type: f.type,
            })),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setPendingFiles([]);
        setIsLoading(true);

        // Placeholder — replace with your AI API call
        setTimeout(() => {
            const reply: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `I received your message${userMsg.attachments.length > 0 ? ` along with ${userMsg.attachments.length} file${userMsg.attachments.length > 1 ? "s" : ""}` : ""}. This is a placeholder — connect me to an AI backend to get real answers!`,
                attachments: [],
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, reply]);
            setIsLoading(false);
        }, 1200);
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {/* ── Header ── */}
            <header className="flex-none flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
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
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">Chatbot</span>
                </div>

                {/* Profile card — top-right */}
                <ProfileCard user={user} signOutAction={signOutAction} />
            </header>

            {/* ── Messages ── */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} user={user} />
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex items-end gap-2.5">
                            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white shadow">
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
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                <div className="flex gap-1 items-center h-4">
                                    <span
                                        className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    />
                                    <span
                                        className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    />
                                    <span
                                        className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* ── Input bar ── */}
            <div className="flex-none bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <div className="mx-auto max-w-3xl">
                    {/* Pending file chips */}
                    {pendingFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {pendingFiles.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300"
                                >
                                    <svg
                                        className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                        />
                                    </svg>
                                    <span className="max-w-[150px] truncate">{f.name}</span>
                                    <span className="text-zinc-400">({formatBytes(f.size)})</span>
                                    <button
                                        type="button"
                                        onClick={() => removePendingFile(i)}
                                        className="ml-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                        aria-label={`Remove ${f.name}`}
                                    >
                                        <svg
                                            className="h-3.5 w-3.5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* Paperclip button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label="Attach file"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                            </svg>
                        </button>

                        {/* Text input */}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message…"
                            className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
                        />

                        {/* Send button */}
                        <button
                            type="submit"
                            disabled={isLoading || (!input.trim() && pendingFiles.length === 0)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                            aria-label="Send message"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"
                                />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
