"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ragApi } from "@/lib/rag-api";
import { AttachmentList } from "./components/AttachmentList";
import { MessageContent } from "./components/MessageContent";
import { formatBytes, formatTime } from "./formatters";
import type { Attachment, MessageAttachment, UserProps } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────

type Message = {
    id: string;
    role: "user" | "bot";
    content: string;
    attachments: MessageAttachment[];
    timestamp: Date;
};

type Props = {
    user: UserProps;
    signOutAction: () => Promise<void>;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function statusFromApi(status: string): Attachment["status"] {
    switch (status.toLowerCase()) {
        case "completed":
            return "completed";
        case "failed":
            return "failed";
        default:
            return "processing";
    }
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
    const displayName = user.name;
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
                                    {user.email}
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
    const displayName = user.name;
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
                        <div className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed">
                            <MessageContent content={message.content} />
                        </div>
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollingFileIds = useRef(new Set<string>());
    const automaticallySelectedFileIds = useRef(new Set<string>());
    const selectedReadyFiles = uploadedFiles.filter((file) => selectedFileIds.has(file.id) && file.isProcessed);

    function autoSelectProcessedFile(id: string) {
        if (automaticallySelectedFileIds.current.has(id)) return;

        automaticallySelectedFileIds.current.add(id);
        setSelectedFileIds((fileIds) => new Set(fileIds).add(id));
    }

    // auto scroll to bottom whenever new message is added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // init with useEffect to ensure local time is used
    useEffect(() => {
        setMessages([
            {
                id: "welcome",
                role: "bot",
                content: `Hi, ${user.name.split(" ")[0]}! 👋 I'm your AI assistant. How can I help you today? Attach files before sending your messages.`,
                attachments: [],
                timestamp: new Date(),
            },
        ]);
    }, [user.name]);

    // Each processing file is polled independently. The effect is reset as files
    // finish, fail, are removed, or are added, so completed files are never polled.
    useEffect(() => {
        const processingFiles = uploadedFiles.filter((file) => file.status === "processing");
        if (processingFiles.length === 0) return;

        let cancelled = false;
        const pollProcessingFiles = async () => {
            await Promise.all(processingFiles.map(async (file) => {
                if (pollingFileIds.current.has(file.id)) return; // if already polling, no need to start another poll
                pollingFileIds.current.add(file.id);
                try {
                    const response = await ragApi.getFilesProcessingStatus(user.email, file.id);
                    if (cancelled) return;
                    const status = statusFromApi(response.processing_status);
                    const isProcessed = status === "completed";
                    const error = status === "failed" ? "Processing failed." : undefined;
                    if (isProcessed) {
                        autoSelectProcessedFile(file.id);
                    }
                    setUploadedFiles((files) => {
                        const currentFile = files.find((item) => item.id === file.id);
                        if (!currentFile || (currentFile.status === status && currentFile.isProcessed === isProcessed && currentFile.error === error)) return files;
                        return files.map((item) => item.id === file.id ? { ...item, status, isProcessed, error } : item);
                    });
                } catch {
                    // A transient status-check failure should not make the file unusable.
                    // The next ten-second poll will retry it.
                } finally {
                    pollingFileIds.current.delete(file.id);
                }
            }));
        };

        void pollProcessingFiles();
        const intervalId = window.setInterval(() => void pollProcessingFiles(), 10_000);
        return () => { // clean up function to make sure polling stops when component unmounts or dependencies change
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [uploadedFiles, user.email]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        addFiles(Array.from(e.target.files ?? []));
        e.target.value = "";
    }

    function addFiles(files: File[] | FileList) {
        const arr = Array.from(files ?? []);
        if (arr.length === 0) return;

        // create new Attachment objects
        const newFiles: Attachment[] = arr.map((file) => {
            return {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                status: "uploading",
                isProcessed: false,
            };
        });

        // add new files to state
        setUploadedFiles((files) => [...files, ...newFiles]);

        // upload each new file to the API
        newFiles.forEach((attachment, index) => {
            void ragApi.uploadFiles([arr[index]], attachment.id, user.email)
                .then((response) => {
                    // update file based on API response, process will unlikely be processed immediately
                    // but this code is a safeguard to ensure the file status is updated correctly
                    const status = statusFromApi(response.files[0]?.processing_status ?? "processing");
                    const isProcessed = status === "completed";
                    const error = status === "failed" ? "Processing failed." : undefined;
                    if (isProcessed) {
                        autoSelectProcessedFile(attachment.id);
                    }
                    setUploadedFiles((files) => {
                        const currentFile = files.find((file) => file.id === attachment.id);
                        if (!currentFile || (currentFile.status === status && currentFile.isProcessed === isProcessed && currentFile.error === error)) return files;
                        return files.map((file) => file.id === attachment.id ? { ...file, status, isProcessed, error } : file);
                    });
                })
                .catch(() => {
                    setUploadedFiles((files) => files.map((file) => file.id === attachment.id
                        ? { ...file, status: "failed", isProcessed: false, error: "Upload failed." }
                        : file,
                    ));
                });
        });
    }

    function removeUploadedFile(id: string) {
        setUploadedFiles((files) => files.filter((f) => f.id !== id));
        setSelectedFileIds((files) => {
            const updatedFiles = new Set(files);
            updatedFiles.delete(id);
            return updatedFiles;
        });
    }

    function toggleSelectFile(id: string) {
        setSelectedFileIds((files) => {
            const updatedFiles = new Set(files);
            if (updatedFiles.has(id)) updatedFiles.delete(id);
            else updatedFiles.add(id);
            return updatedFiles;
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmedInput,
            attachments: selectedReadyFiles
                .map((f) => ({ id: f.id, name: f.name, size: f.size, type: f.type })),
            timestamp: new Date(),
        };

        // if no files are selected, show a warning message instead of sending the query
        if (selectedFileIds.size === 0) {
            setMessages((messages) => [...messages, userMessage]);
            setInput("");
            setIsLoading(true);
            await new Promise((resolve) => window.setTimeout(resolve, 1_000)); // simulate a short delay between the user message and the bot response for better UX
            setMessages((messages) => [
                ...messages,
                {
                    id: crypto.randomUUID(),
                    role: "bot",
                    content: "Please upload and select a file before sending a message.",
                    attachments: [],
                    timestamp: new Date(),
                },
            ]);
            setIsLoading(false);
            return;
        }

        setMessages((messages) => [...messages, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await ragApi.query({
                user_id: user.email,
                query: trimmedInput,
                top_k: 5,
                folder_names: Array.from(selectedFileIds),
                conversation_id: conversationId,
            });

            setConversationId(response.conversation_id);
            const botResponse: Message = {
                id: crypto.randomUUID(),
                role: "bot",
                content: response.answer,
                attachments: [],
                timestamp: new Date(),
            };
            setMessages((messages) => [...messages, botResponse]);
        } finally {
            setIsLoading(false);
        }
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
            <main className="flex-1 overflow-hidden">
                <div className="mx-auto max-w-5xl px-4 py-6 flex gap-6 h-full flex-col md:flex-row">
                    {/* Files sidebar */}
                    <aside className="w-full md:w-72 flex-shrink-0 md:sticky md:top-6 self-start space-y-3">
                        <div
                            className={`bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow ${isDraggingOver ? "ring-2 ring-emerald-400/60" : ""
                                }`}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDraggingOver(true);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // required to allow drop
                                e.dataTransfer.dropEffect = "copy";
                                setIsDraggingOver(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDraggingOver(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDraggingOver(false);
                                const dt = e.dataTransfer;
                                if (dt?.files && dt.files.length > 0) {
                                    addFiles(dt.files);
                                }
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-semibold">Files</div>
                                <div className="text-xs text-zinc-400">{uploadedFiles.length}</div>
                            </div>
                            {uploadedFiles.length === 0 ? (
                                <p className="text-xs text-zinc-500">No files uploaded — use the attach button.</p>
                            ) : (
                                <AttachmentList
                                    files={uploadedFiles}
                                    selectedFileIds={selectedFileIds}
                                    onToggle={toggleSelectFile}
                                    onRemove={removeUploadedFile}
                                    variant="sidebar"
                                />
                            )}
                        </div>
                        <div className="flex gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-relaxed text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                            <svg
                                className="mt-0.5 h-4 w-4 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>
                                PDFs are recommended. We process texts within attachments to find relevant words, and selected files are included in your next message.
                            </p>
                        </div>
                    </aside>

                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-4">
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
                    </div>
                </div>
            </main>

            {/* Mobile files strip */}
            <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2">
                {uploadedFiles.length > 0 ? (
                    <AttachmentList
                        files={uploadedFiles}
                        selectedFileIds={selectedFileIds}
                        onToggle={toggleSelectFile}
                        onRemove={removeUploadedFile}
                        variant="mobile"
                    />
                ) : (
                    <div className="text-xs text-zinc-500">No uploaded files</div>
                )}
            </div>

            {/* ── Input bar ── */}
            <div className="flex-none bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <div className="mx-auto max-w-5xl">
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
                            disabled={isLoading || (!input.trim() && selectedReadyFiles.length === 0)}
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
