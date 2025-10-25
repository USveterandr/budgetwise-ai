# Transaction Management - Quick Start Guide

## Overview
This guide provides a quick overview of how to use the Transaction Management feature in BudgetWise AI.

## Getting Started

### 1. Accessing Transactions
- Navigate to the "Transactions" page from the main dashboard
- View your transaction history in the table format
- Use the search bar to find specific transactions

### 2. Adding a New Transaction
1. Click the "Add Transaction" button
2. Fill in the required fields:
   - Date
   - Description
   - Category
   - Amount
   - Type (Income, Expense, or Transfer)
3. Optionally add:
   - Merchant
   - Tags
   - Notes
4. Click "Add" to save the transaction

### 3. Using AI Categorization
1. When adding or editing a transaction, enter a description
2. Click the "AI Suggest" button next to the category field
3. The system will automatically suggest an appropriate category
4. Accept the suggestion or choose a different category

### 4. Searching and Filtering
- Use the search bar to find transactions by description, merchant, or notes
- Filter by:
  - Category
  - Transaction type
  - Date range
  - Merchant
  - Amount range
  - Tags
- Sort by date, amount, description, merchant, or category

### 5. Editing Transactions
1. Click the edit icon (pencil) next to any transaction
2. Modify the transaction details
3. Click "Update" to save changes

### 6. Deleting Transactions
1. Click the delete icon (trash) next to any transaction
2. Confirm the deletion when prompted

### 7. Bulk Operations
1. Select multiple transactions using the checkboxes
2. Use the bulk actions dropdown to:
   - Delete selected transactions
   - Update categories for selected transactions
   - Apply other bulk changes

### 8. Managing Categories
1. Categories are automatically suggested based on transaction details
2. To manage your categories:
   - Go to the category management section
   - Add new categories
   - Edit existing categories
   - Delete unused categories

### 9. Viewing Statistics
- The dashboard shows:
  - Total income
  - Total expenses
  - Net balance
  - Spending by category
  - Top merchants

## API Endpoints

### Transactions
- `GET /api/transactions` - Retrieve transactions with optional filtering
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/[id]` - Update an existing transaction
- `DELETE /api/transactions/[id]` - Delete a transaction

### Bulk Operations
- `POST /api/transactions/bulk-delete` - Delete multiple transactions
- `POST /api/transactions/bulk-update` - Update multiple transactions

### Categories
- `GET /api/categories` - Retrieve user categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category

### AI and Statistics
- `POST /api/transactions/categorize` - Get AI-powered category suggestions
- `GET /api/transactions/stats` - Retrieve transaction statistics

## Tips for Best Results

1. **Be descriptive**: Use detailed descriptions to help the AI categorize transactions accurately
2. **Use tags**: Add tags for custom organization (e.g., "vacation", "gift", "business")
3. **Regular maintenance**: Periodically review and clean up categories
4. **Leverage bulk operations**: Use bulk actions when managing multiple transactions
5. **Check statistics**: Regularly review your spending patterns in the dashboard

## Troubleshooting

### Common Issues
1. **Transaction not saving**: Check that all required fields are filled in
2. **Category not found**: Ensure the category exists or create a new one
3. **Search returning no results**: Try broadening your search terms
4. **Bulk operations failing**: Check that you've selected transactions

### Getting Help
- Check the documentation for detailed information
- Contact support if you encounter persistent issues
- Submit feature requests for enhancements

## Next Steps
- Explore the Budget Management feature to set spending limits
- Try the Investment Tracking module for portfolio management
- Use the AI Financial Advisor for personalized insights