import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { requireUserId } from "~/utils/auth.server";
import { jsonError } from "~/utils/responses.server";
import advisorPrompt from "../../../ai/financial-advisor.txt?raw";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (!context.env.AI) {
    return jsonError("AI binding is not configured", 500);
  }

  let userId: string;
  try {
    userId = await requireUserId(request, context.env);
  } catch (error) {
    return jsonError("Unauthorized", 401);
  }

  const transactions = await context.env.DB.prepare(
    `SELECT merchant, amount, category, occurred_at
     FROM transactions WHERE user_id = ?`
  )
    .bind(userId)
    .all();

  const data = transactions.results ?? [];
  const prompt = `${advisorPrompt.trim()}\n\nAnalyze these transactions and produce:\n- Spending summary\n- 3 risks\n- 3 actionable recommendations\nTransactions JSON:${JSON.stringify(data)}`;

  const ai = await context.env.AI.run("@cf/meta/llama-3-8b-instruct", { prompt });

  const id = crypto.randomUUID();
  await context.env.DB.prepare(
    `INSERT INTO ai_insights (id, user_id, type, content)
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, userId, "monthly", JSON.stringify(ai))
    .run();

  return json(ai);
};
