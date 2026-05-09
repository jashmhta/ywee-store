import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";

export default async function handler(request: Request, context: any) {
  const url = new URL(request.url);
  const endpoint = "/api/trpc";

  // Extract procedure path from the URL
  // URL might be /.netlify/functions/trpc/auth.me or /api/trpc/auth.me
  let procedurePath = "";
  const trpcMatch = url.pathname.match(/trpc\/?(.*)/);
  if (trpcMatch) {
    procedurePath = trpcMatch[1];
  }

  // Reconstruct the URL as if it was the original /api/trpc/* request
  const reconstructedUrl = url.origin + endpoint + "/" + procedurePath + url.search;

  // Pass to tRPC fetch handler
  return fetchRequestHandler({
    endpoint,
    req: new Request(reconstructedUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    }),
    router: appRouter,
    createContext,
    path: procedurePath,
  });
}
