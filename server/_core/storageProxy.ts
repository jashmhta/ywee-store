import type { Express } from "express";
import path from "path";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    const serveLocal = () => {
      const localPath = path.resolve(process.cwd(), "client/public/manus-storage", key);
      res.sendFile(localPath, (err) => {
        if (err) {
          res.status(404).send("File not found");
        }
      });
    };

    if (!(ENV as any).forgeApiUrl || !(ENV as any).forgeApiKey) {
      serveLocal();
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        (ENV as any).forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${(ENV as any).forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        console.warn(`[StorageProxy] forge error ${forgeResp.status}, falling back to local`);
        serveLocal();
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        console.warn("[StorageProxy] empty signed URL, falling back to local");
        serveLocal();
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.warn("[StorageProxy] forge failed, falling back to local:", err);
      serveLocal();
    }
  });
}
