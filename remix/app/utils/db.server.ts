import type { AppLoadContext } from "@remix-run/cloudflare";

export function getDb(env: AppLoadContext["env"]) {
  return env.DB;
}

export async function fetchAll<T = unknown>(
  env: AppLoadContext["env"],
  query: string,
  bindings: Array<string | number | null> = []
) {
  const statement = env.DB.prepare(query).bind(...bindings);
  const result = await statement.all<T>();
  return result.results ?? [];
}
