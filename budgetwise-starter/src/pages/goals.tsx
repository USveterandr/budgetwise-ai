// Goals page - Detailed view of financial goals
import { useState } from 'react';
import Head from 'next/head';

export default function Goals() {
  const [goals, setGoals] = useState([
    {
      id: '1',
      name: 'Emergency Fund',
      target: 10000,
      current: 2500,
      targetDate: '2026-12-31',
      type: 'emergency'
    },
    {
      id: '2',
      name: 'Vacation Fund',
      target: 5000,
      current: 1200,
      targetDate: '2025-08-15',
      type: 'vacation'
    },
    {
      id: '3',
      name: 'Retirement Savings',
      target: 500000,
      current: 12000,
      targetDate: '2050-12-31',
      type: 'retirement'
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    current: '',
    targetDate: '',
    type: 'emergency'
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal = {
      id: `${goals.length + 1}`,
      name: formData.name,
      target: parseFloat(formData.target),
      current: parseFloat(formData.current) || 0,
      targetDate: formData.targetDate,
      type: formData.type
    };
    
    setGoals([...goals, newGoal]);
    setFormData({
      name: '',
      target: '',
      current: '',
      targetDate: '',
      type: 'emergency'
    });
    setShowForm(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>BudgetWise - Financial Goals</title>
        <meta name="description" content="Track and manage your financial goals" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <p className="mt-1 text-sm text-gray-500">Plan and track your financial objectives</p>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {showForm ? 'Cancel' : 'Create New Goal'}
              </button>
            </div>

            {showForm && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Goal</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Goal Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Goal Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="emergency">Emergency Fund</option>
                        <option value="vacation">Vacation</option>
                        <option value="retirement">Retirement</option>
                        <option value="college">College Fund</option>
                        <option value="investment">Investment</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                        Target Amount ($)
                      </label>
                      <input
                        type="number"
                        name="target"
                        id="target"
                        value={formData.target}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="current" className="block text-sm font-medium text-gray-700">
                        Current Amount ($)
                      </label>
                      <input
                        type="number"
                        name="current"
                        id="current"
                        value={formData.current}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
                        Target Date
                      </label>
                      <input
                        type="date"
                        name="targetDate"
                        id="targetDate"
                        value={formData.targetDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Create Goal
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {goals.map((goal) => (
                  <li key={goal.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {goal.name}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {goal.type}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="mr-6 flex items-center text-sm text-gray-500">
                            Target: ${goal.target.toLocaleString()}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            Current: ${goal.current.toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {goal.targetDate}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {((goal.current / goal.target) * 100).toFixed(1)}% complete
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}