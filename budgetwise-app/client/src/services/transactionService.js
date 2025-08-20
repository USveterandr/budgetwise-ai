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
    }
  }

  static async updateTransaction(transactionId, updateData) {
    try {
      const response = await api.put(`/transactions/${transactionId}`, updateData);
      return response.transaction;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(transactionId) {
    try {
      await api.delete(`/transactions/${transactionId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }

  static async getTransactionsByDateRange(userId, startDate, endDate) {
    try {
      const response = await api.get(`/transactions?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      return response.transactions;
    } catch (error) {
      console.error('Failed to fetch transactions by date range:', error);
      throw error;
    }
  }

  static async getTransactionsByCategory(userId, category) {
    try {
      const response = await api.get(`/transactions?userId=${userId}&category=${category}`);
      return response.transactions;
    } catch (error) {
      console.error('Failed to fetch transactions by category:', error);
      throw error;
    }
  }

  static async getTotalIncome(userId, startDate, endDate) {
    try {
      const response = await api.get(`/transactions/total-income?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      return response.total;
    } catch (error) {
      console.error('Failed to fetch total income:', error);
      throw error;
    }
  }

  static async getTotalExpenses(userId, startDate, endDate) {
    try {
      const response = await api.get(`/transactions/total-expenses?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      return response.total;
    } catch (error) {
      console.error('Failed to fetch total expenses:', error);
      throw error;
    }
  }
}

export default TransactionService;