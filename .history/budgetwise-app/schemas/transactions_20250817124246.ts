// schemas/transaction.ts
import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive(),
  date: z.date(),
  categoryId: z.string().uuid(),
  description: z.string().min(3).max(100)
});