// transactionService.js
import api from './api';

class TransactionService {
  static async getTransactions(userId) {
    try {
      const response = await api.get(`/transactions?userId=${userId}`);
      return response.transactions;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }

  static async getTransactionById(transactionId) {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.transaction;
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      throw error;
    }
  }

  static async createTransaction(transactionData) {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.transaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
