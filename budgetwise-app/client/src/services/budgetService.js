// budgetService.js
import api from './api';

class BudgetService {
  static async getBudgets(userId) {
    try {
      const response = await api.get(`/budgets?userId=${userId}`);
      return response.budgets;
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      throw error;
    }
  }

  static async getBudgetById(budgetId) {
    try {
      const response = await api.get(`/budgets/${budgetId}`);
      return response.budget;
    } catch (error) {
      console.error('Failed to fetch budget:', error);
      throw error;
    }
  }

  static async createBudget(budgetData) {
    try {
      const response = await api.post('/budgets', budgetData);
      return response.budget;
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  }

  static async updateBudget(budgetId, updateData) {
    try {
      const response = await api.put(`/budgets/${budgetId}`, updateData);
      return response.budget;
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  }

  static async deleteBudget(budgetId) {
    try {
      await api.delete(`/budgets/${budgetId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  }

  static async getBudgetByCategory(userId, category) {
    try {
      const response = await api.get(`/budgets?userId=${userId}&category=${category}`);
      return response.budget;
    } catch (error) {
      console.error('Failed to fetch budget by category:', error);
      throw error;
    }
  }

  static async getTotalBudget(userId) {
    try {
      const response = await api.get(`/budgets/total?userId=${userId}`);
      return response.total;
    } catch (error) {
      console.error('Failed to fetch total budget:', error);
      throw error;
    }
  }

  static async getBudgetProgress(userId, category) {
    try {
      const response = await api.get(`/budgets/progress?userId=${userId}&category=${category}`);
      return response.progress;
    } catch (error) {
      console.error('Failed to fetch budget progress:', error);
      throw error;
    }
  }

  static async getOverspentCategories(userId) {
    try {
      const response = await api.get(`/budgets/overspent?userId=${userId}`);
      return response.categories;
    } catch (error) {
      console.error('Failed to fetch overspent categories:', error);
      throw error;
    }
  }
}

export default BudgetService;