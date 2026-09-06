import { auth } from "@/auth";
import { createRagToken } from "@/lib/rag-token";

export const runtime = "nodejs";

const ROUTE_METHODS: Record<string, readonly string[]> = {
  "": ["GET"],
  health: ["GET"],
  "files/upload": ["POST"],
  "files/processing-status": ["GET"],
  "chat/query": ["POST"],
  "chat/conversations": ["GET"],
};

function allowedMethods(apiPath: string): readonly string[] | undefined {
  if (/^chat\/conversations\/\d+$/.test(apiPath)) return ["GET", "DELETE"]; // for dynamic conversation ID paths
  return ROUTE_METHODS[apiPath];
}

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ detail: "Unauthorized" }, { status: 401 });
  // Cookie-authenticated mutations must come from this origin, including uploads.
  if (request.method !== "GET" && request.method !== "HEAD" &&
      request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ detail: "Forbidden origin" }, { status: 403 });
  }
  const { path } = await context.params;
  const apiPath = path.join("/");
  const methods = allowedMethods(apiPath);
  if (!methods) return Response.json({ detail: "Unsupported API path" }, { status: 404 });
  if (!methods.includes(request.method)) {
    return Response.json(
      { detail: "Unsupported API method" },
      { status: 405, headers: { Allow: methods.join(", ") } },
    );
  }
  const incomingUrl = new URL(request.url);
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("authorization", `Bearer ${await createRagToken(session.user.email, session.user.name)}`);
  const upstream = await fetch(`${process.env.API_BASE_URL}/${apiPath}${incomingUrl.search}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    duplex: "half",
    cache: "no-store",
    redirect: "error",
  } as RequestInit);
  const responseHeaders = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/json",
    "cache-control": "no-store",
  });
  const challenge = upstream.headers.get("www-authenticate");
  if (challenge) responseHeaders.set("www-authenticate", challenge);
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
