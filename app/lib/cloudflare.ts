/**
 * Cloudflare D1 & R2 Client Bridge
 * This replaces Supabase by calling our Cloudflare Worker API
 */

// Placeholder URL - update this after deploying the worker
const CLOUDFLARE_WORKER_URL = 'https://budgetwise-backend.isaactrinidadllc.workers.dev';

export const cloudflare = {
    // Profiles
    async getProfile(userId: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/profile?userId=${userId}&t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    async updateProfile(profile: any, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(profile)
        });
        return res.json();
    },

    async uploadAvatar(userId: string, imageUri: string, idToken: string) {
        const formData = new FormData();
        formData.append('userId', userId);
        
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append('avatar', { uri: imageUri, name: filename, type });

        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/profile/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            body: formData
        });
        return res.json();
    },

    // Transactions
    async getTransactions(userId: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/transactions?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    async addTransaction(transaction: any, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(transaction)
        });
        return res.json();
    },

    async deleteTransaction(id: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    // Budgets
    async getBudgets(userId: string, month: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/budgets?userId=${userId}&month=${month}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    async addBudget(budget: any, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/budgets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(budget)
        });
        return res.json();
    },

    async updateBudget(id: string, spent: number, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/budgets`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ id, spent })
        });
        return res.json();
    },

    // Investments
    async getInvestments(userId: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    async addInvestment(investment: any, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(investment)
        });
        return res.json();
    },

    async updateInvestment(id: string, investment: any, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(investment)
        });
        return res.json();
    },

    async deleteInvestment(id: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/investments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    // Notifications
    async getNotifications(userId: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/notifications?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    async addNotification(notification: any, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(notification)
        });
        return res.json();
    },

    async markNotificationAsRead(id: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        return res.json();
    },

    // Storage
    async uploadFile(userId: string, file: Blob, filename: string, idToken: string) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/storage/upload?userId=${userId}&filename=${filename}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` },
            body: file
        });
        return res.json();
    }
};
