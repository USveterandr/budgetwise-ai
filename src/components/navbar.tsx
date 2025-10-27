"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bars3Icon, 
  XMarkIcon,
  ChartBarIcon, 
  CreditCardIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth-client";
import { logout } from "@/lib/auth-client";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Check if the user is authenticated and is admin
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        setShowAdminLink(currentUser.isAdmin);
      }
    };
    
    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
    { name: "Transactions", href: "/transactions", icon: CreditCardIcon },
    { name: "Budget", href: "/budget", icon: WalletIcon },
    { name: "Investments", href: "/investments", icon: ArrowTrendingUpIcon },
    { name: "Receipts", href: "/receipts", icon: DocumentTextIcon },
  ];

  const adminNavigation = [
    { name: "Admin", href: "/admin", icon: ShieldCheckIcon },
  ];

  const navigation = showAdminLink 
    ? [...baseNavigation, ...adminNavigation] 
    : baseNavigation;

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-semibold text-blue-600">
                BudgetWise<span className="text-gray-900">AI</span>
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 text-sm font-medium`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex md:items-center">
              <Link 
                href="/assessment" 
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-4"
              >
                <SparklesIcon className="h-4 w-4 mr-1.5" />
                Free Assessment
              </Link>
              <button
                type="button"
                className="relative p-1 text-gray-400 hover:text-gray-500"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
              </button>
              <div className="ml-3 relative flex items-center">
                {user && (
                  <button
                    onClick={handleLogout}
                    className="ml-3 p-1 text-gray-400 hover:text-gray-500"
                    aria-label="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                )}
                <div className="ml-3 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open menu"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-2 inline" />
                  {item.name}
                </Link>
              );
            })}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-800 block pl-3 pr-4 py-2 text-base font-medium w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 inline" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}