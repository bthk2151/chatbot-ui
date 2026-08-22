export type Attachment = {
    id: string;
    name: string;
    size: number;
    type: string;
    status: "uploading" | "processing" | "completed" | "failed";
    isProcessed: boolean;
    error?: string;
};

export type MessageAttachment = Pick<Attachment, "id" | "name" | "size" | "type">;

export type UserProps = {
    name: string;
    email: string;
    image: string | null;
};
