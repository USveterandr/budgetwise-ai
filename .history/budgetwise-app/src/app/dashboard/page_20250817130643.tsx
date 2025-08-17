'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NetWorthCard from '@/components/NetWorthCard';
import TransactionList from '@/components/TransactionList';

export default function DashboardPage() {
  const [userId] = useState('user_1'); // Replace with actual auth
  const router = useRouter();

  const handlePlaidLink = async () => {
    // Get link token from backend
    const response = await fetch('/api/plaid/create_link_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: ['auth', 'transactions'] })
    });
    
    const { link_token } = await response.json();
    
    // Initialize Plaid Link
    const handler = Plaid.create({
      token: link_token,
      onSuccess: async (public_token) => {
        // Exchange public token
        await fetch('/api/plaid/exchange_public_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicToken: public_token, userId })
        });
        
        router.refresh();
      },
    });
    
    handler.open();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button 
          onClick={handlePlaidLink}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
        >
          Link Bank Account
        </button>
      </div>
      
      <NetWorthCard />
      <TransactionList userId={userId} />
    </div>
  );
}