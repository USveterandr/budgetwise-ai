import { json } from "@remix-run/cloudflare";

export function jsonError(message: string, status = 400) {
  return json({ error: message }, { status });
}
