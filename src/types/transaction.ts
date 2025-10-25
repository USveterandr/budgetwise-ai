export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  receipt_url: string | null;
  merchant?: string;
  tags?: string;
  notes?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export type TransactionFormData = Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & { id?: string };