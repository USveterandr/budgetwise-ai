// subscriptionService.js
import api from './api';

class SubscriptionService {
  static async getSubscriptions(userId) {
    try {
      const response = await api.get(`/subscriptions?userId=${userId}`);
      return response.subscriptions;
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw error;
    }
  }

  static async getSubscriptionById(subscriptionId) {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      return response.subscription;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      throw error;
    }
  }

  static async createSubscription(subscriptionData) {
    try {
      const response = await api.post('/subscriptions', subscriptionData);
      return response.subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(subscriptionId, updateData) {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}`, updateData);
      return response.subscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  static async deleteSubscription(subscriptionId) {
    try {
      await api.delete(`/subscriptions/${subscriptionId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId) {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/cancel`);
      return response.subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  static async getActiveSubscriptions(userId) {
    try {
      const response = await api.get(`/subscriptions/active?userId=${userId}`);
      return response.subscriptions;
    } catch (error) {
      console.error('Failed to fetch active subscriptions:', error);
      throw error;
    }
  }

  static async getSubscriptionsByCategory(userId, category) {
    try {
      const response = await api.get(`/subscriptions?userId=${userId}&category=${category}`);
      return response.subscriptions;
    } catch (error) {
      console.error('Failed to fetch subscriptions by category:', error);
      throw error;
    }
  }

  static async getTotalMonthlyCost(userId) {
    try {
      const response = await api.get(`/subscriptions/total-monthly?userId=${userId}`);
      return response.total;
    } catch (error) {
      console.error('Failed to fetch total monthly cost:', error);
      throw error;
    }
  }

  static async getUpcomingRenewals(userId, days = 7) {
    try {
      const response = await api.get(`/subscriptions/upcoming?userId=${userId}&days=${days}`);
      return response.subscriptions;
    } catch (error) {
      console.error('Failed to fetch upcoming renewals:', error);
      throw error;
    }
  }
}

export default SubscriptionService;