import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifySessionToken, type SessionPayload } from "../auth";
import { ForbiddenError } from "@shared/_core/errors";

export class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) return new Map<string, string>();
    return new Map(Object.entries(parseCookieHeader(cookieHeader)));
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);

    if (!sessionCookie) {
      throw ForbiddenError("No session cookie");
    }

    const session = await verifySessionToken(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session");
    }

    let user = await db.getUserById(session.userId);
    if (!user) {
      throw ForbiddenError("User not found");
    }

    return user;
  }
}

export const sdk = new SDKServer();
