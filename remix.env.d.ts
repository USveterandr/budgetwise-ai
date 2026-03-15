/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

interface AiService {
  run: (model: string, options: Record<string, unknown>) => Promise<unknown>;
}

interface Env {
  DB: D1Database;
  AI: AiService;
  R2: R2Bucket;
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  HUBSPOT_TOKEN: string;
}

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: Env;
    cf?: IncomingRequestCfProperties;
  }
}
