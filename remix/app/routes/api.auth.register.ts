import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { hashPassword } from "~/utils/auth.server";
import { jsonError } from "~/utils/responses.server";
import { parseJsonBody } from "~/utils/validation.server";

const registerSchema = z.object({
  email: z.string().email().transform(value => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const body = await parseJsonBody(request, registerSchema);
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(body.password);

  try {
    await context.env.DB.prepare(
      `INSERT INTO users (id,email,password_hash) VALUES (?,?,?)`
    )
      .bind(id, body.email, passwordHash)
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE")) {
      return jsonError("Email already registered", 409);
    }
    console.error("Register failed", error);
    return jsonError("Unable to create account", 500);
  }

  return json({ success: true });
};
