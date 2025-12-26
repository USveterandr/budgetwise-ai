# Cloudflare D1 & R2 Migration Guide

I have successfully replaced **Supabase** with **Cloudflare D1** (SQL Database) and **Cloudflare R2** (Object Storage). 

Because Cloudflare D1 cannot be called directly from a mobile/web client (like Supabase's client), I have built a **Cloudflare Worker API** that acts as the secure bridge.

## 🛠️ Components Created:
1.  **`backend/src/index.ts`**: The Cloudflare Worker that handles all DB and Storage requests.
2.  **`schema.sql`**: The SQL schema for your new D1 database.
3.  **`app/lib/cloudflare.ts`**: The new frontend client that replaces the Supabase client.
4.  **Updated Contexts**: `AuthContext`, `FinanceContext`, and `NotificationContext` now use Cloudflare.

## 🚀 Final Setup Instructions

### 1. Create the D1 Database
Go to your Cloudflare Dashboard or run the following command in your terminal:
```bash
npx wrangler d1 create budgetwise_db
```
**Copy the `database_id`** from the output and paste it into `backend/wrangler.toml`.

### 2. Initialize the Database Schema
Run this command to create the tables in your new D1 database:
```bash
npx wrangler d1 execute budgetwise_db --file=./schema.sql
```

### 3. Create the R2 Bucket
Run this command to create your storage bucket for receipts:
```bash
npx wrangler r2 bucket create budgetwise-assets
```

### 4. Deploy the Worker
Navigate to the `backend` folder and deploy:
```bash
cd backend
npx wrangler deploy
```

### 5. Update the App Client
Once deployed, you will get a URL like `https://budgetwise-api.your-subdomain.workers.dev`.
Open `app/lib/cloudflare.ts` and update the `CLOUDFLARE_WORKER_URL` constant with your new URL.

---

### Sync Note:
Your app still uses **Firebase Firestore** for some real-time logic. I kept this intact to ensure your recent Firebase migration remains functional while moving the heavy lifting (budgets, transactions, investments) to Cloudflare.
