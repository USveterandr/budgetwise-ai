/**
 * Cloudflare D1 & R2 Client Bridge
 * This replaces Supabase by calling our Cloudflare Worker API
 */

// Placeholder URL - update this after deploying the worker
const CLOUDFLARE_WORKER_URL = 'https://budgetwise-api.isaactrinidadllc.workers.dev';

export const cloudflare = {
    // Profiles
    async getProfile(userId: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/profile?userId=${userId}&t=${Date.now()}`);
        return res.json();
    },

    async updateProfile(profile: any) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        return res.json();
    },

    // Transactions
    async getTransactions(userId: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/transactions?userId=${userId}`);
        return res.json();
    },

    async addTransaction(transaction: any) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        return res.json();
    },

    async deleteTransaction(id: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/transactions/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Budgets
    async getBudgets(userId: string, month: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/budgets?userId=${userId}&month=${month}`);
        return res.json();
    },

    async addBudget(budget: any) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budget)
        });
        return res.json();
    },

    async updateBudget(id: string, spent: number) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/budgets`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, spent })
        });
        return res.json();
    },

    // Investments
    async getInvestments(userId: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments?userId=${userId}`);
        return res.json();
    },

    async addInvestment(investment: any) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(investment)
        });
        return res.json();
    },

    async updateInvestment(id: string, investment: any) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(investment)
        });
        return res.json();
    },

    async deleteInvestment(id: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Notifications
    async getNotifications(userId: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/notifications?userId=${userId}`);
        return res.json();
    },

    async addNotification(notification: any) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        });
        return res.json();
    },

    async markNotificationAsRead(id: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/notifications/${id}/read`, {
            method: 'PUT'
        });
        return res.json();
    },

    // Storage
    async uploadFile(userId: string, file: Blob, filename: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/storage/upload?userId=${userId}&filename=${filename}`, {
            method: 'POST',
            body: file
        });
        return res.json();
    }
};
