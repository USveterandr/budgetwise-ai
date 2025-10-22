# Transaction Feature Setup and Testing Guide

This document provides instructions for setting up and testing the transaction management feature in BudgetWise AI.

## Overview

The transaction management feature allows users to:
- Create, read, update, and delete financial transactions
- Track income and expenses
- Categorize transactions
- View transaction history

## Prerequisites

1. Cloudflare account with Workers and D1 database setup
2. Database worker deployed with transaction tables created
3. Environment variables configured

## Setup Instructions

### 1. Database Schema

Ensure the following table exists in your D1 database:

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT,
  category TEXT,
  amount REAL,
  type TEXT CHECK(type IN ('income','expense')),
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_DATABASE_WORKER_URL=https://your-worker.your-account.workers.dev
```

### 3. Deploy Database Worker

Deploy the updated database worker with transaction endpoints:

```bash
cd workers
wrangler deploy
```

## API Endpoints

### Create Transaction
```
POST /transactions
```

Request body:
```json
{
  "user_id": "user_123",
  "date": "2023-06-15",
  "description": "Grocery shopping",
  "category": "Food",
  "amount": 85.30,
  "type": "expense",
  "receipt_url": null
}
```

### Get User Transactions
```
GET /transactions/user/{user_id}?limit=50&offset=0
```

### Update Transaction
```
PUT /transactions/{transaction_id}
```

Request body (partial update):
```json
{
  "description": "Updated description",
  "amount": 95.50
}
```

### Delete Transaction
```
DELETE /transactions/{transaction_id}
```

## Testing

### Automated Testing

Run the test script to verify all endpoints:

```bash
node test-transaction-api.js
```

### Manual Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the transactions page:
   ```
   http://localhost:3000/transactions
   ```

3. Test the following actions:
   - Add a new transaction
   - Edit an existing transaction
   - Delete a transaction
   - Verify transactions are persisted in the database

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your database worker has proper CORS headers configured.

2. **404 Errors**: Verify the database worker URL is correctly set in environment variables.

3. **Database Connection**: Check that your D1 database is properly configured and accessible.

### Debugging Tips

1. Check the browser console for JavaScript errors
2. Check the database worker logs in Cloudflare dashboard
3. Verify database schema matches expected structure
4. Test API endpoints directly with tools like Postman or curl

## Next Steps

After implementing transactions, the next features to focus on are:
1. Budget management
2. Investment tracking
3. Receipt management
4. Reporting and analytics

Refer to the [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md) for detailed timelines and priorities.