/**
 * Cloudflare D1 & R2 Client Bridge
 * Authentication + Data Access
 */

// Point to production backend for stability during testing
export const CLOUDFLARE_API_URL = 'https://budgetwise-backend.isaactrinidadllc.workers.dev';
const CLOUDFLARE_WORKER_URL = CLOUDFLARE_API_URL;

export const cloudflare = {
    // Auth - Login
    async login(email, password) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data; // { token, userId, profile }
    },

    // Auth - Signup
    async signup(email, password, name) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        return data; // { token, userId }
    },

    async resetPassword(email) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed');
        return data; 
    },

    async confirmPasswordReset(token, newPassword) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/auth/update-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Password update failed');
        return data;
    },

    // Profiles
    async getProfile(token) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Profile fetch failed');
        return data;
    },

    async updateProfile(profile, token) {
        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profile)
        });
        return res.json();
    },

    async uploadAvatar(imageUri, token) {
        const formData = new FormData();

        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append('avatar', { uri: imageUri, name: filename, type });

        const res = await fetch(`${CLOUDFLARE_WORKER_URL}/profile/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
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
