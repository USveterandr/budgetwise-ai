import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { requireUserId } from "~/utils/auth.server";
import { jsonError } from "~/utils/responses.server";
import { parseJsonBody } from "~/utils/validation.server";

const transactionSchema = z.object({
  merchant: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().optional(),
  occurred_at: z.string().datetime().optional()
});

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  try {
    const userId = await requireUserId(request, context.env);
    const rows = await context.env.DB.prepare(
      `SELECT id, merchant, amount, category, occurred_at, created_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY occurred_at DESC`
    )
      .bind(userId)
      .all();

    return json(rows.results ?? []);
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    if ((error as { status?: number }).status === 401) {
      throw jsonError("Unauthorized", 401);
    }
    console.error("Transactions loader failed", error);
    throw jsonError("Unable to fetch transactions", 500);
  }
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  let userId: string;
  try {
    userId = await requireUserId(request, context.env);
  } catch (error) {
    return jsonError("Unauthorized", 401);
  }

  const body = await parseJsonBody(
    request,
    transactionSchema.transform(data => ({
      ...data,
      occurred_at: data.occurred_at ?? new Date().toISOString()
    }))
  );

  const id = crypto.randomUUID();

  await context.env.DB.prepare(
    `INSERT INTO transactions (id, user_id, merchant, amount, category, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, userId, body.merchant, body.amount, body.category ?? null, body.occurred_at)
    .run();

  return json({ id, ...body });
};
