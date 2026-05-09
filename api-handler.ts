import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = req.url ?? "/";
  const pathMatch = url.match(/^\/api\/trpc\/([^?]*)/);
  const path = pathMatch?.[1] ?? "";

  try {
    await nodeHTTPRequestHandler({
      router: appRouter,
      createContext,
      req,
      res,
      path,
    });
  } catch (error) {
    console.error("[tRPC Error]", error);
    res.status(500).json({ error: { code: "500", message: "Internal server error" } });
  }
}
