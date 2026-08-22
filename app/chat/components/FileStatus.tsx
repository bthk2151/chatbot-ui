import type { Attachment } from "@/app/chat/types";

export function FileStatus({ file }: { file: Attachment }) {
    if (file.status === "completed") {
        return <span className="text-xs text-emerald-600 dark:text-emerald-400">Ready</span>;
    }
    if (file.status === "failed") {
        return <span className="text-xs text-red-600 dark:text-red-400">Failed</span>;
    }
    return (
        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
            {file.status === "uploading" ? "Uploading" : "Processing"}
        </span>
    );
}
