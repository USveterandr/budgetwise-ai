import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Shield, Users, Search, RefreshCcw, Trash2, Plus, Download,
} from "lucide-react";
import { toast } from "sonner";

const API = `${(process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '') : '')}/api`;

const AdminDashboard = () => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [summary, setSummary] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResp = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMe(meResp.data);
        if (!meResp.data.is_admin) {
          toast.error("Admin access required");
          return;
        }
        await Promise.all([fetchUsers(1, pageSize, q, plan), fetchSummary()]);
      } catch (e) {
        toast.error("Not authorized or backend unreachable");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (p = page, ps = pageSize, qv = q, pl = plan) => {
    try {
      const resp = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: p, page_size: ps, q: qv || undefined, plan: pl || undefined }
      });
      setUsers(resp.data.items || []);
      setTotal(resp.data.total || 0);
      setPage(resp.data.page || p);
      setPageSize(resp.data.page_size || ps);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to load users");
    }
  };

  const fetchSummary = async () => {
    try {
      const resp = await axios.get(`${API}/admin/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(resp.data);
    } catch (e) {
      toast.error("Failed to load summary");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user and all related data?")) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted");
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to delete user");
    }
  };

  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    password: "",
    subscription_plan: "free",
    is_admin: false
  });

  const createUser = async () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      await axios.post(`${API}/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User created");
      setNewUser({ email: "", full_name: "", password: "", subscription_plan: "free", is_admin: false });
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create user");
    }
  };

  const exportCSV = async () => {
    try {
      const resp = await axios.get(`${API}/admin/reports/exports/users.csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error("Failed to export CSV");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-violet-600" />
          </div>
          <p className="text-gray-600">Loading Admin...</p>
        </div>
      </div>
    );
  }

  if (!me?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin access is required to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const plans = [
    { id: "", name: "All Plans" },
    { id: "free", name: "Free" },
    { id: "personal-plus", name: "Personal Plus" },
    { id: "investor", name: "Investor" },
    { id: "business-pro-elite", name: "Business Pro Elite" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and view platform reports</p>
          </div>
          <Badge variant="outline" className="text-violet-600 border-violet-200">Admin</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.totals?.users ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.active?.last_7d ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Free vs Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Free: {summary?.totals?.by_plan?.["free"] ?? 0} • Paid: {(summary?.totals?.by_plan?.["personal-plus"] ?? 0) + (summary?.totals?.by_plan?.["investor"] ?? 0) + (summary?.totals?.by_plan?.["business-pro-elite"] ?? 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <Label>Email contains</Label>
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  <Input className="pl-10" placeholder="Search email" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              </div>
              <div className="w-full md:w-60">
                <Label>Plan</Label>
                <select className="w-full border rounded-md h-10 px-3" value={plan} onChange={(e) => setPlan(e.target.value)}>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <Button onClick={() => fetchUsers(1, pageSize, q, plan)}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table & Create */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={exportCSV}>
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Email</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Plan</th>
                      <th className="py-2">Admin</th>
                      <th className="py-2">Created</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-2">{u.email}</td>
                        <td className="py-2">{u.full_name}</td>
                        <td className="py-2">{u.subscription_plan}</td>
                        <td className="py-2">{u.is_admin ? 'Yes' : 'No'}</td>
                        <td className="py-2">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                        <td className="py-2">
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteUser(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">Total: {total}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>
                    Prev
                  </Button>
                  <span className="text-sm">Page {page}</span>
                  <Button variant="outline" disabled={(page * pageSize) >= total} onClick={() => fetchUsers(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create User</CardTitle>
              <CardDescription>Quickly add a user (password emailed separately if needed)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label>Email</Label>
                  <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div>
                  <Label>Plan</Label>
                  <select className="w-full border rounded-md h-10 px-3" value={newUser.subscription_plan} onChange={(e) => setNewUser({ ...newUser, subscription_plan: e.target.value })}>
                    {plans.filter(p => p.id !== "").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_admin" type="checkbox" checked={newUser.is_admin} onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })} />
                  <Label htmlFor="is_admin">Make admin</Label>
                </div>
                <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-500" onClick={createUser}>
                  <Plus className="h-4 w-4 mr-2" /> Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;