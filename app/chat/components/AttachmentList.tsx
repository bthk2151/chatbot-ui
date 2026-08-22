import type { Attachment } from "@/app/chat/types";
import { formatBytes } from "@/app/chat/formatters";
import { FileStatus } from "./FileStatus";

type AttachmentListProps = {
    files: Attachment[];
    selectedFileIds: Set<string>;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    variant: "sidebar" | "mobile";
};

export function AttachmentList({ files, selectedFileIds, onToggle, onRemove, variant }: AttachmentListProps) {
    const isMobile = variant === "mobile";

    return (
        <div className={isMobile ? "flex gap-2 overflow-x-auto" : "flex flex-col gap-2 max-h-60 overflow-auto"}>
            {files.map((file) => (
                <div
                    key={file.id}
                    className={isMobile ? "flex items-center gap-2 rounded-lg bg-black/5 dark:bg-white/10 px-3 py-2 min-w-[140px]" : "flex items-center gap-2"}
                >
                    <input
                        id={`${isMobile ? "mob" : "sidebar"}-sel-${file.id}`}
                        type="checkbox"
                        checked={selectedFileIds.has(file.id)}
                        onChange={() => onToggle(file.id)}
                        disabled={!file.isProcessed}
                        className="h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">{file.name}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">{formatBytes(file.size)}</span>
                            <FileStatus file={file} />
                        </div>
                        {file.error && <div className="text-xs text-red-600 dark:text-red-400">{file.error}</div>}
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(file.id)}
                        className="text-zinc-400 hover:text-zinc-600 ml-2"
                        aria-label={`Remove ${file.name}`}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
