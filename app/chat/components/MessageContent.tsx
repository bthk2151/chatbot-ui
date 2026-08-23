import ReactMarkdown from "react-markdown";

type MessageContentProps = {
    content: string;
};

export function MessageContent({ content }: MessageContentProps) {
    return (
        <ReactMarkdown
            components={{
                h1: ({ children }) => <h1 className="text-xl font-bold mt-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mt-4 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mt-3 first:mt-0">{children}</h3>,
                p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
                ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 marker:text-zinc-500 dark:marker:text-zinc-400">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5 marker:text-zinc-500 dark:marker:text-zinc-400">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em>{children}</em>,
                a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-emerald-700 dark:text-emerald-300 underline underline-offset-2">
                        {children}
                    </a>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
