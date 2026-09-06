import "server-only";
import { importPKCS8, SignJWT } from "jose";

const TOKEN_TTL_SECONDS = 300;
let signingKey: ReturnType<typeof importPKCS8> | undefined;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`${name} is required`);
  return value;
}

/** Only call with an identity established by Auth.js, never browser input. */
export async function createRagToken(email: string, name?: string | null): Promise<string> {
  if (!email || email.trim() !== email) throw new Error("Authenticated email is required");
  const issuer = requiredEnv("RAG_JWT_ISSUER");
  const audience = requiredEnv("RAG_JWT_AUDIENCE");
  if (!signingKey) {
    signingKey = importPKCS8(requiredEnv("RAG_JWT_PRIVATE_KEY").replace(/\\n/g, "\n"), "RS256");
    signingKey.catch(() => { signingKey = undefined; });
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(name ? { name } : {})
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setSubject(email)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_TTL_SECONDS)
    .sign(await signingKey);
}
