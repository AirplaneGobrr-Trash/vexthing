import type { BunRequest, BunResponse, Handler } from "../bunrest"

declare module "@airplanegobrr/bunrest/src/server/request" {
  interface BunRequest {
    added: true;
    revTime: number;
  }
}


declare module "@airplanegobrr/bunrest/src/server/response" {
  interface BunResponse {
    async render(sheet: string, options?: Record<string, any>): Promise<void>;
    async renderRaw(sheet: string, options?: Record<string, any>): Promise<string>; // Returns raw HTML
    locals: Record<string, string>
  }
}
