export type FileProcessingStatus = "uploaded" | "processing" | "completed" | "failed";
export type UserResponse = { id: string; name: string; last_login_date: string };
export type ChatQueryRequest = { user_id: string; query: string; conversation_id?: number | null; top_k?: number; folder_names?: string[] | null; similarity_threshold?: number | null };
export type RetrievedContextChunk = { file_id: number; file_name: string; folder_name: string; chunk_index: number; chunk_text: string; similarity_score: number; page_number?: number | null };
export type ChatQueryResponse = { conversation_id: number; query: string; answer: string; context: RetrievedContextChunk[] };
export type UploadedFileMetadata = { id: number; original_file_name: string; content_type: string | null; size_bytes: number; gcs_path: string; folder_name: string; metadata?: Record<string, unknown> | null; processing_status: FileProcessingStatus; created_at: string };
export type FileUploadBatchResponse = { files: UploadedFileMetadata[]; job_triggered: boolean; job_execution_name?: string | null };
export type ConversationSummary = { id: number; title: string | null; created_at: string; updated_at: string };
export type ConversationListResponse = { conversations: ConversationSummary[] };
export type ChatMessageItem = { id: number; role: string; content: string; created_at: string };
export type ConversationMessagesResponse = { conversation_id: number; user_id: string; title: string | null; messages: ChatMessageItem[] };

export class RagApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "RagApiError"; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/rag${path}`, init);
  if (response.ok) return response.status === 204 ? (undefined as T) : (await response.json()) as T;
  let message = `Request failed with status ${response.status}.`;
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body && "detail" in body) message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
  } catch { /* Retain the status-based error for non-JSON responses. */ }
  throw new RagApiError(message, response.status);
}

/** Browser client for every endpoint in the RAG API's OpenAPI schema. */
export const ragApi = {
  health: () => request<unknown>("/health"),
  root: () => request<unknown>("/"),
  login: (input: { id: string; name: string }) => request<UserResponse>("/users/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
  uploadFiles: (files: File[], folderName: string, metadata?: Record<string, unknown>) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.set("folder_name", folderName);
    if (metadata) formData.set("metadata", JSON.stringify(metadata));
    return request<FileUploadBatchResponse>("/files/upload", { method: "POST", body: formData });
  },
  query: (input: ChatQueryRequest) => request<ChatQueryResponse>("/chat/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
  listConversations: (userId: string) => request<ConversationListResponse>(`/chat/conversations?user_id=${encodeURIComponent(userId)}`),
  getConversation: (conversationId: number, userId: string) => request<ConversationMessagesResponse>(`/chat/conversations/${conversationId}?user_id=${encodeURIComponent(userId)}`),
  deleteConversation: (conversationId: number, userId: string) => request<void>(`/chat/conversations/${conversationId}?user_id=${encodeURIComponent(userId)}`, { method: "DELETE" }),
};
