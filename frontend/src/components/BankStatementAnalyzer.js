import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

const API = `${(process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '') : '')}/api`;

const BankStatementAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'
    ];
    if (!allowed.includes(f.type)) {
      toast.error("Please upload a PDF or image (JPG/PNG/WEBP/HEIC)");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20MB)");
      return;
    }

    setFile(f);
  };

  const analyzeStatement = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const token = localStorage.getItem('token');
      const resp = await axios.post(`${API}/ai/bank-statement/summarize`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(resp.data.summary || null);
      toast.success("Statement analyzed successfully");
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to analyze statement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) => {
    if (n === null || n === undefined) return 'N/A';
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); } catch { return `${n}`; }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📄 Bank Statement Analyzer</h1>
            <p className="text-gray-600">Upload your bank statement to get a concise AI summary.</p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Statement
            </CardTitle>
            <CardDescription>PDF or clear image up to 20MB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
              <Button onClick={analyzeStatement} disabled={!file || loading} className="bg-gradient-to-r from-violet-500 to-purple-500">
                {loading ? 'Analyzing...' : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <div className="max-w-5xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Statement Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">From: </span>{formatDate(result.period_start)}</div>
                  <div><span className="text-gray-500">To: </span>{formatDate(result.period_end)}</div>
                  <div><span className="text-gray-500">Transactions: </span>{result.transaction_count ?? 'N/A'}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Balances & Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Opening Balance: </span>{formatCurrency(result.opening_balance)}</div>
                  <div><span className="text-gray-500">Closing Balance: </span>{formatCurrency(result.closing_balance)}</div>
                  <div><span className="text-gray-500">Total Deposits: </span>{formatCurrency(result.total_deposits)}</div>
                  <div><span className="text-gray-500">Total Withdrawals: </span>{formatCurrency(result.total_withdrawals)}</div>
                  <div><span className="text-gray-500">Largest Deposit: </span>{formatCurrency(result.largest_deposit)}</div>
                  <div><span className="text-gray-500">Largest Withdrawal: </span>{formatCurrency(result.largest_withdrawal)}</div>
                </div>
              </CardContent>
            </Card>

            {result.categories && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(result.categories).map(([k, v]) => (
                      <div key={k} className="p-4 rounded-lg border bg-white">
                        <div className="text-sm text-gray-500 capitalize">{k}</div>
                        <div className="text-lg font-semibold">{formatCurrency(v)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.confidence >= 0.7 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{Math.round((result.confidence || 0) * 100)}%</Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankStatementAnalyzer;