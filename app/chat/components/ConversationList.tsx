import type { ConversationSummary } from "@/lib/rag-api";

type ConversationListProps = {
    conversations: ConversationSummary[];
    isLoading: boolean;
    error: string | null;
    selectedConversationId: number | null;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
    onCreateNew: () => void;
    isCreateDisabled: boolean;
    isDeleteDisabled: boolean;
    deletingConversationIds: ReadonlySet<number>;
    actionError: string | null;
};

function conversationLabel(conversation: ConversationSummary) {
    return conversation.title?.trim() || "Untitled conversation";
}

export function ConversationList({
    conversations,
    isLoading,
    error,
    selectedConversationId,
    onSelect,
    onDelete,
    onCreateNew,
    isCreateDisabled,
    isDeleteDisabled,
    deletingConversationIds,
    actionError,
}: ConversationListProps) {
    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={onCreateNew}
                disabled={isCreateDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
                <span aria-hidden="true">+</span>
                New conversation
            </button>

            {actionError && (
                <p className="text-xs text-red-600 dark:text-red-400">{actionError}</p>
            )}

            {isLoading ? (
                <p className="text-xs text-zinc-500">Loading conversations…</p>
            ) : error ? (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            ) : conversations.length === 0 ? (
                <p className="text-xs text-zinc-500">No conversations yet.</p>
            ) : (
                <div className="flex max-h-60 flex-col gap-1 overflow-y-auto">
                    {conversations.map((conversation) => {
                        const isSelected = selectedConversationId === conversation.id;
                        const isDeleting = deletingConversationIds.has(conversation.id);

                        return (
                            <div
                                key={conversation.id}
                                className={`flex w-full items-center rounded-lg text-sm transition-colors ${isSelected
                                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(conversation.id)}
                                    aria-pressed={isSelected}
                                    className="min-w-0 flex-1 px-3 py-2 text-left"
                                >
                                    <span className="block truncate font-medium">{conversationLabel(conversation)}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(conversation.id)}
                                    disabled={isDeleteDisabled || isDeleting}
                                    className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                    aria-label={`Delete ${conversationLabel(conversation)}`}
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
