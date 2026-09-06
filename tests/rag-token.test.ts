import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { exportPKCS8, generateKeyPair, jwtVerify } from "jose";

vi.mock("server-only", () => ({}));
const keys = await generateKeyPair("RS256", { extractable: true });

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("RAG_JWT_PRIVATE_KEY", (await exportPKCS8(keys.privateKey)).replace(/\n/g, "\\n"));
  vi.stubEnv("RAG_JWT_ISSUER", "chatbot-ui-test");
  vi.stubEnv("RAG_JWT_AUDIENCE", "tree-rag-test");
});
afterEach(() => vi.unstubAllEnvs());

test("signs an RS256 token preserving the exact email with a five-minute lifetime", async () => {
  const { createRagToken } = await import("../lib/rag-token");
  const token = await createRagToken("Alice@Example.com", "Alice");
  const { payload, protectedHeader } = await jwtVerify(token, keys.publicKey, {
    algorithms: ["RS256"], issuer: "chatbot-ui-test", audience: "tree-rag-test",
  });
  expect(protectedHeader.typ).toBe("JWT");
  expect(payload.sub).toBe("Alice@Example.com");
  expect(payload.name).toBe("Alice");
  expect(payload.exp! - payload.iat!).toBe(300);
});

test.each(["RAG_JWT_PRIVATE_KEY", "RAG_JWT_ISSUER", "RAG_JWT_AUDIENCE"])(
  "fails closed without %s", async (setting) => {
    vi.stubEnv(setting, "");
    const { createRagToken } = await import("../lib/rag-token");
    await expect(createRagToken("Alice@Example.com")).rejects.toThrow(setting);
  },
);

test("rejects empty identity and invalid private keys", async () => {
  const { createRagToken } = await import("../lib/rag-token");
  await expect(createRagToken("")).rejects.toThrow();
  vi.stubEnv("RAG_JWT_PRIVATE_KEY", "invalid");
  await expect(createRagToken("Alice@Example.com")).rejects.toThrow();
});
