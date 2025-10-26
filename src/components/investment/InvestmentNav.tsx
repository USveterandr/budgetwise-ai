"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function InvestmentNav() {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Dashboard', href: '/investments/dashboard' },
    { name: 'Performance', href: '/investments/performance' },
    { name: 'Reports', href: '/investments/reports' },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              pathname === item.href
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}