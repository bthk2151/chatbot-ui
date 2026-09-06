import { afterEach, beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), token: vi.fn(), fetch: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rag-token", () => ({ createRagToken: mocks.token }));
import { GET, POST } from "../app/api/rag/[...path]/route";

const context = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://rag.example.com");
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.auth.mockResolvedValue({ user: { email: "Alice@Example.com", name: "Alice" } });
  mocks.token.mockResolvedValue("signed-user-token");
  mocks.fetch.mockResolvedValue(Response.json({ conversations: [] }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("rejects anonymous requests before issuing a token or contacting FastAPI", async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await GET(new Request("https://ui.example.com/api/rag/chat/conversations"),
    context("chat/conversations"))).status).toBe(401);
  expect(mocks.token).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

test("replaces browser authorization with server identity and disables caching and redirects", async () => {
  const response = await GET(new Request("https://ui.example.com/api/rag/chat/conversations?user_id=Bob", {
    headers: { authorization: "Bearer browser-controlled", cookie: "private-session" },
  }), context("chat/conversations"));
  expect(mocks.token).toHaveBeenCalledWith("Alice@Example.com", "Alice");
  const init = mocks.fetch.mock.calls[0][1];
  expect(init.headers.get("authorization")).toBe("Bearer signed-user-token");
  expect(init.headers.has("cookie")).toBe(false);
  expect(init.cache).toBe("no-store");
  expect(init.redirect).toBe("error");
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.text()).not.toContain("signed-user-token");
});

test.each([undefined, "https://attacker.example.com"])("blocks mutations with untrusted origin %s", async (origin) => {
  const response = await POST(new Request("https://ui.example.com/api/rag/files/upload", {
    method: "POST", headers: origin ? { origin } : {},
  }), context("files/upload"));
  expect(response.status).toBe(403);
  expect(mocks.fetch).not.toHaveBeenCalled();
});

test("streams same-origin uploads without changing the multipart body", async () => {
  const form = new FormData();
  form.set("id", "Alice@Example.com");
  form.set("files", new File(["contents"], "file.txt"));
  const request = new Request("https://ui.example.com/api/rag/files/upload", {
    method: "POST", body: form, headers: { origin: "https://ui.example.com" },
  });
  await POST(request, context("files/upload"));
  const init = mocks.fetch.mock.calls[0][1];
  expect(init.body).toBe(request.body);
  expect(init.headers.get("content-type")).toBe(request.headers.get("content-type"));
});

test("does not expose the login callback endpoint through the browser proxy", async () => {
  const response = await POST(new Request("https://ui.example.com/api/rag/users/login", {
    method: "POST", headers: { origin: "https://ui.example.com" },
  }), context("users/login"));
  expect(response.status).toBe(404);
  expect(mocks.fetch).not.toHaveBeenCalled();
});
