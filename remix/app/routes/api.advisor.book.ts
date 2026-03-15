import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { requireUserId } from "~/utils/auth.server";
import { jsonError } from "~/utils/responses.server";

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  const env = context.env;

  let userId: string;
  try {
    userId = await requireUserId(request, env);
  } catch {
    return jsonError("Unauthorized", 401);
  }

  // Generate a unique request ID
  const id = crypto.randomUUID();

  // Insert into D1
  await env.DB.prepare(
    "INSERT INTO advisor_requests (id, user_id) VALUES (?, ?)"
  )
    .bind(id, userId)
    .run();

  // Trigger HubSpot email automation (best-effort)
  if (env.HUBSPOT_TOKEN) {
    try {
      const res = await fetch(
        `https://api.hubapi.com/automation/v3/workflows/enrollments/contacts/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userId }),
        }
      );
      if (!res.ok) {
        console.error("HubSpot API Error:", await res.text());
      }
    } catch (e) {
      console.error("HubSpot Trigger Failed:", e);
    }
  } else {
    console.warn("HUBSPOT_TOKEN not set. Skipping email automation.");
  }

  return json({
    bookingUrl: "https://meetings.hubspot.com/YOUR-ADVISOR-LINK",
    requestId: id,
  });
}
