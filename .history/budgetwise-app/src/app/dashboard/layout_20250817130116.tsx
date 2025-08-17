import { ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  noStore(); // Opt out of caching
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}