"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    proUsers: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    recentSignups: 0,
    cancellations: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // TODO: Check if current user is admin
  useEffect(() => {
    // This is a placeholder - in a real implementation, you would check user permissions
    setIsAdmin(true);
    
    // Fetch mock data
    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    // Mock API call
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'premium', status: 'active', lastActive: '2025-10-19T10:30:00Z' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', plan: 'free', status: 'active', lastActive: '2025-10-19T14:15:00Z' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', plan: 'pro', status: 'suspended', lastActive: '2025-10-18T09:45:00Z' },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', plan: 'premium', status: 'active', lastActive: '2025-10-20T08:20:00Z' },
    ];
    setUsers(mockUsers);
  };

  const fetchAnalytics = async () => {
    // Mock API call
    const mockAnalytics = {
      totalUsers: 1247,
      activeUsers: 892,
      suspendedUsers: 45,
      freeUsers: 623,
      premiumUsers: 412,
      proUsers: 212,
      monthlyRevenue: 8456.75,
      annualRevenue: 97254.20,
      recentSignups: 23,
      cancellations: 5
    };
    setAnalytics(mockAnalytics);
  };

  const toggleUserStatus = async (userId: string) => {
    // Mock API call
    console.log(`Toggling status for user ${userId}`);
    // In a real implementation, you would make an API call to update the user status
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { 
      title: "Total Users", 
      value: analytics.totalUsers.toLocaleString(), 
      icon: <UsersIcon className="h-5 w-5 text-blue-500" />,
      change: `+${analytics.recentSignups} new`,
      color: "text-green-500"
    },
    { 
      title: "Monthly Revenue", 
      value: `$${analytics.monthlyRevenue.toLocaleString()}`, 
      icon: <CurrencyDollarIcon className="h-5 w-5 text-green-500" />,
      change: "+12.5%",
      color: "text-green-500"
    },
    { 
      title: "Active Users", 
      value: analytics.activeUsers.toLocaleString(), 
      icon: <UserGroupIcon className="h-5 w-5 text-purple-500" />,
      change: "-2.3%",
      color: "text-red-500"
    },
    { 
      title: "Annual Revenue", 
      value: `$${(analytics.annualRevenue / 1000).toFixed(1)}k`, 
      icon: <ChartBarIcon className="h-5 w-5 text-yellow-500" />,
      change: "+8.7%",
      color: "text-green-500"
    },
  ];

  const planDistribution = [
    { name: "Free", value: analytics.freeUsers, color: "bg-gray-500" },
    { name: "Premium", value: analytics.premiumUsers, color: "bg-blue-500" },
    { name: "Pro", value: analytics.proUsers, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and view analytics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((item, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{item.value}</h3>
                    <p className={`text-xs mt-1 ${item.color}`}>
                      {item.change}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-full">
                    {item.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <UsersIcon className="h-5 w-5 mr-2 text-blue-500" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${user.plan === 'free' ? 'bg-gray-100 text-gray-800' : 
                                user.plan === 'premium' ? 'bg-blue-100 text-blue-800' : 
                                'bg-purple-100 text-purple-800'}`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserMinusIcon className="h-4 w-4 mr-1" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            {/* Plan Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {planDistribution.map((plan, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{plan.name}</span>
                        <span className="text-gray-600">{plan.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${plan.color} h-2 rounded-full`} 
                          style={{ width: `${(plan.value / analytics.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly</span>
                    <span className="font-medium">${analytics.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual</span>
                    <span className="font-medium">${analytics.annualRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Signups</span>
                    <span className="font-medium text-green-600">+{analytics.recentSignups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancellations</span>
                    <span className="font-medium text-red-600">-{analytics.cancellations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}