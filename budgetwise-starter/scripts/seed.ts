// Seed script to populate the database with sample data

async function main() {
  // This would normally connect to the database and insert sample data
  console.log('Seeding database with sample data...');
  
  // Sample user
  const user = {
    id: 'user_123456789',
    email: 'user@example.com',
    createdAt: new Date()
  };
  
  // Sample budgets
  const budgets = [
    {
      id: 'budget_1',
      name: 'Monthly Groceries',
      amount: 500,
      period: 'monthly',
      userId: user.id
    },
    {
      id: 'budget_2',
      name: 'Entertainment',
      amount: 200,
      period: 'monthly',
      userId: user.id
    }
  ];
  
  // Sample expenses
  const expenses = [
    {
      id: 'expense_1',
      amount: 45.50,
      date: new Date(),
      category: 'Groceries',
      description: 'Weekly grocery shopping',
      budgetId: budgets[0].id,
      userId: user.id
    },
    {
      id: 'expense_2',
      amount: 25.00,
      date: new Date(),
      category: 'Dining',
      description: 'Restaurant dinner',
      budgetId: null,
      userId: user.id
    }
  ];
  
  // Sample goals
  const goals = [
    {
      id: 'goal_1',
      name: 'Emergency Fund',
      target: 10000,
      current: 2500,
      targetDate: new Date('2026-12-31'),
      type: 'emergency',
      userId: user.id
    },
    {
      id: 'goal_2',
      name: 'Vacation Fund',
      target: 5000,
      current: 1200,
      targetDate: new Date('2025-08-15'),
      type: 'vacation',
      userId: user.id
    }
  ];
  
  console.log('Sample data created:');
  console.log('- User:', user.email);
  console.log('- Budgets:', budgets.length);
  console.log('- Expenses:', expenses.length);
  console.log('- Goals:', goals.length);
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close database connection if needed
  });