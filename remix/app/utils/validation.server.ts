import type { ZodSchema, ZodTypeDef, TypeOf } from "zod";
import { jsonError } from "~/utils/responses.server";

export async function parseJsonBody<T extends ZodTypeDef, S extends ZodSchema<any, T, any>>(
  request: Request,
  schema: S
): Promise<TypeOf<S>> {
  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch (error) {
    throw jsonError("Invalid JSON payload", 400);
  }

  const result = schema.safeParse(parsedBody);
  if (!result.success) {
    throw jsonError(result.error.message, 422);
  }

  return result.data;
}
