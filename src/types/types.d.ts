import type { BunRequest, BunResponse, Handler } from "../bunrest"

declare module "bunrest/src/server/request" {
  interface BunRequest {
    cookies: CookieMap;
    added: true;
  }
}


declare module "bunrest/src/server/response" {
  interface BunResponse {
    async render(sheet: string, options?: Record<string, any>): Promise<void>;
    async renderRaw(sheet: string, options?: Record<string, any>): Promise<string>; // Returns raw HTML
    cookie(name: string, value: string, options?: { httpOnly?: boolean; maxAge?: number }): void;
    locals: Record<string, string>
  }
}
