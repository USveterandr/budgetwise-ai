import { supabase } from './supabase';

/**
 * Sync a transaction to Supabase.
 * @param transaction The transaction object from local DB
 * @param userId The current Firebase Auth user ID
 */
export const syncTransactionToSupabase = async (transaction: any, userId: string) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .upsert({
        id: transaction.id,
        user_id: userId,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
      });

    if (error) {
      console.error('Error syncing transaction to Supabase:', error);
      throw error;
    }
    console.log(`Transaction ${transaction.id} synced to Supabase`);
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

/**
 * Fetch all transactions for a user from Supabase.
 * @param userId The current Firebase Auth user ID
 */
export const getSupabaseTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions from Supabase:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    return [];
  }
};

/**
 * Delete a transaction from Supabase.
 * @param transactionId The ID of the transaction to delete
 */
export const deleteSupabaseTransaction = async (transactionId: string) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Error deleting transaction from Supabase:', error);
      throw error;
    }
    console.log(`Transaction ${transactionId} deleted from Supabase`);
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};
