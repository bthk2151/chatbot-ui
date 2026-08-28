import type { ConversationSummary } from "@/lib/rag-api";

type ConversationListProps = {
    conversations: ConversationSummary[];
    isLoading: boolean;
    error: string | null;
    selectedConversationId: number | null;
    onSelect: (id: number) => void;
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
}: ConversationListProps) {
    if (isLoading) {
        return <p className="text-xs text-zinc-500">Loading conversations…</p>;
    }

    if (error) {
        return <p className="text-xs text-red-600 dark:text-red-400">{error}</p>;
    }

    if (conversations.length === 0) {
        return <p className="text-xs text-zinc-500">No conversations yet.</p>;
    }

    return (
        <div className="flex max-h-60 flex-col gap-1 overflow-y-auto">
            {conversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.id;

                return (
                    <button
                        key={conversation.id}
                        type="button"
                        onClick={() => onSelect(conversation.id)}
                        aria-pressed={isSelected}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${isSelected
                            ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <span className="block truncate font-medium">{conversationLabel(conversation)}</span>
                    </button>
                );
            })}
        </div>
    );
}
