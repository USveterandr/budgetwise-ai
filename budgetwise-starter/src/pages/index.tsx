// Home page - Main dashboard
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>BudgetWise - Personal Finance Management</title>
        <meta name="description" content="Track expenses, create budgets, and plan for your financial goals" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">BudgetWise</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add Expense
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Create Budget
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700 font-bold">U</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Spent This Month</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">$1,240</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Goals On Track</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">2/5</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Budget Utilization</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">78%</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">$4,500</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 py-6 sm:px-0">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'budgets'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Budgets
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'goals'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Goals
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reports
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-6 sm:px-0">
            {activeTab === 'dashboard' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Dashboard Overview</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Your financial health at a glance</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Spending by Category</h4>
                        <div className="space-y-4">
                          <CategoryBar category="Housing" spent={850} limit={1000} percentage={85} />
                          <CategoryBar category="Food" spent={420} limit={500} percentage={84} />
                          <CategoryBar category="Transportation" spent={280} limit={300} percentage={93} />
                          <CategoryBar category="Entertainment" spent={180} limit={200} percentage={90} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Transactions</h4>
                        <div className="space-y-3">
                          <TransactionItem description="Grocery Store" amount={85.50} date="2023-06-15" />
                          <TransactionItem description="Gas Station" amount={45.00} date="2023-06-14" />
                          <TransactionItem description="Restaurant" amount={67.25} date="2023-06-14" />
                          <TransactionItem description="Online Shopping" amount={120.00} date="2023-06-13" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budgets' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Budgets</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your spending categories</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="mb-6">
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Create New Budget
                      </button>
                    </div>
                    <div className="space-y-4">
                      <BudgetItem name="Monthly Groceries" amount={500} spent={420} />
                      <BudgetItem name="Entertainment" amount={200} spent={180} />
                      <BudgetItem name="Transportation" amount={300} spent={280} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Financial Goals</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Track progress toward your financial objectives</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="mb-6">
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Create New Goal
                      </button>
                    </div>
                    <div className="space-y-4">
                      <GoalItem 
                        name="Emergency Fund" 
                        target={10000} 
                        current={2500} 
                        targetDate="2026-12-31" 
                        type="emergency" 
                      />
                      <GoalItem 
                        name="Vacation Fund" 
                        target={5000} 
                        current={1200} 
                        targetDate="2025-08-15" 
                        type="vacation" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Reports & Exports</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Generate and download financial reports</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Export Reports</h4>
                        <div className="space-y-4">
                          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Export as PDF
                          </button>
                          <button className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Export as CSV
                          </button>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Import Data</h4>
                        <div className="space-y-4">
                          <button className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                            Import CSV
                          </button>
                          <div className="text-sm text-gray-500">
                            <p>Supported formats: CSV</p>
                            <p className="mt-1">Maximum file size: 10MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CategoryBar({ category, spent, limit, percentage }: { 
  category: string; 
  spent: number; 
  limit: number; 
  percentage: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{category}</span>
        <span className="text-sm font-medium text-gray-700">${spent} of ${limit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function TransactionItem({ description, amount, date }: { 
  description: string; 
  amount: number; 
  date: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-900">{description}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <p className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</p>
    </div>
  );
}

function BudgetItem({ name, amount, spent }: { 
  name: string; 
  amount: number; 
  spent: number;
}) {
  const percentage = (spent / amount) * 100;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-900">{name}</h4>
        <span className="font-medium">${spent.toFixed(2)} of ${amount.toFixed(2)}</span>
      </div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="mt-2 flex justify-between">
        <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
        <button className="text-sm text-blue-600 hover:text-blue-800">Add Expense</button>
      </div>
    </div>
  );
}

function GoalItem({ name, target, current, targetDate, type }: { 
  name: string; 
  target: number; 
  current: number;
  targetDate: string;
  type: string;
}) {
  const percentage = (current / target) * 100;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-900">{name}</h4>
        <span className="font-medium">${current.toFixed(2)} of ${target.toFixed(2)}</span>
      </div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-purple-500" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <p>Target date: {targetDate}</p>
        <p>Type: {type}</p>
      </div>
      <div className="mt-2">
        <button className="text-sm text-blue-600 hover:text-blue-800">Adjust Plan</button>
      </div>
    </div>
  );
}