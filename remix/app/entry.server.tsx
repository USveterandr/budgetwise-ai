import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext,
  loadContext: AppLoadContext
) {
  const body = await renderToReadableStream(
    <RemixServer context={context} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        console.error(error);
      }
    }
  );

  headers.set("Content-Type", "text/html");
  return new Response(body, {
    status: statusCode,
    headers
  });
}
