import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { createToken, hashPassword } from "~/utils/auth.server";
import { jsonError } from "~/utils/responses.server";
import { parseJsonBody } from "~/utils/validation.server";

const loginSchema = z.object({
  email: z.string().email().transform(value => value.toLowerCase()),
  password: z.string().min(1)
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { email, password } = await parseJsonBody(request, loginSchema);
  const passwordHash = await hashPassword(password);

  const user = await context.env.DB.prepare(
    `SELECT id FROM users WHERE email=? AND password_hash=?`
  )
    .bind(email, passwordHash)
    .first<{ id: string }>();

  if (!user?.id) {
    return jsonError("Invalid credentials", 401);
  }

  const token = await createToken(user.id, context.env);
  return json({ token });
};
