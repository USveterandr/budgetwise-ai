import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { jsonError } from "~/utils/responses.server";
import { parseJsonBody } from "~/utils/validation.server";
import expensePrompt from "../../../ai/expense-categorizer.txt?raw";

const schema = z.object({
  merchant: z.string().min(1),
  amount: z.number().positive()
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (!context.env.AI) {
    return jsonError("AI binding is not configured", 500);
  }

  const body = await parseJsonBody(request, schema);

  const aiResponse = (await context.env.AI.run("@cf/meta/llama-3-8b-instruct", {
    prompt: `${expensePrompt.trim()}\nMerchant: ${body.merchant}\nAmount: $${body.amount}`
  })) as unknown;

  return json(aiResponse);
};
