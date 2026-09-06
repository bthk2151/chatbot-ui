import { afterEach, beforeEach, expect, test, vi } from "vitest";
import NextAuth, { type NextAuthConfig } from "next-auth";

const mocks = vi.hoisted(() => ({ token: vi.fn(), fetch: vi.fn() }));
vi.mock("next-auth", () => ({ default: vi.fn(() => ({})) }));
vi.mock("@/lib/rag-token", () => ({ createRagToken: mocks.token }));
await import("../auth");
const config = vi.mocked(NextAuth).mock.calls[0][0] as NextAuthConfig;
const signIn = config.callbacks!.signIn!;
const jwt = config.callbacks!.jwt!;
const identity = {
  user: { id: "google-sub", email: "Alice@Example.com", name: "Alice" },
  account: { provider: "google", type: "oidc" as const, providerAccountId: "google-sub" },
  profile: { email: "Alice@Example.com", email_verified: true },
};

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://rag.example.com");
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.token.mockResolvedValue("callback-token");
  mocks.fetch.mockResolvedValue(new Response(null, { status: 200 }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("Google callback authenticates backend login before a session exists", async () => {
  expect(await signIn(identity)).toBe(true);
  expect(mocks.token).toHaveBeenCalledWith("Alice@Example.com", "Alice");
  const [url, init] = mocks.fetch.mock.calls[0];
  expect(url).toBe("https://rag.example.com/users/login");
  expect(init.headers.Authorization).toBe("Bearer callback-token");
  expect(JSON.parse(init.body).id).toBe("Alice@Example.com");
  expect(init.redirect).toBe("error");
});

test.each([
  { ...identity, profile: { ...identity.profile, email_verified: false } },
  { ...identity, profile: { ...identity.profile, email: "someone-else@example.com" } },
  { ...identity, account: { ...identity.account, provider: "other" } },
])("rejects unverified or mismatched Google identity", async (input) => {
  expect(await signIn(input)).toBe(false);
  expect(mocks.token).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

test("backend login failure prevents sign-in", async () => {
  mocks.fetch.mockResolvedValue(new Response(null, { status: 401 }));
  await expect(signIn(identity)).rejects.toThrow("401");
});

test("invalidates legacy sessions and preserves the verification marker on refresh", async () => {
  const token = { email: "Alice@Example.com" };
  const refresh = { token, account: null } as Parameters<typeof jwt>[0];
  expect(await jwt(refresh)).toBeNull();
  const verified = await jwt({ ...identity, token } as Parameters<typeof jwt>[0]);
  expect(verified?.ragEmailVerified).toBe(true);
  expect(await jwt({ ...refresh, token: verified! })).toEqual(verified);
});
