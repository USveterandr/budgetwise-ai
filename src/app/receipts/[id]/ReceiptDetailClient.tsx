"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Receipt {
  id: string;
  file_url: string;
  uploaded_at: string;
  merchant?: string;
  amount?: number;
  category?: string;
}

export default function ReceiptDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReceipt = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/receipts/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setReceipt(result.receipt);
      } else {
        console.error('Error fetching receipt:', result.error);
        // Fallback to mock data if API fails
        const mockReceipt: Receipt = {
          id: id as string,
          file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=600&h=800&fit=crop',
          uploaded_at: new Date().toISOString(),
          merchant: 'Whole Foods Market',
          amount: 86.42,
          category: 'Groceries'
        };
        
        setReceipt(mockReceipt);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      // Fallback to mock data if API fails
      const mockReceipt: Receipt = {
        id: id as string,
        file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=600&h=800&fit=crop',
        uploaded_at: new Date().toISOString(),
        merchant: 'Whole Foods Market',
        amount: 86.42,
        category: 'Groceries'
      };
      
      setReceipt(mockReceipt);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReceipt();
    }
  }, [id, fetchReceipt]);

  const deleteReceipt = async () => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        router.push('/receipts');
      } else {
        console.error('Error deleting receipt:', result.error);
        alert('Failed to delete receipt');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Failed to delete receipt');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={() => router.push('/receipts')}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Receipts
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Receipt Details</h1>
                <p className="text-gray-600">View and manage your receipt</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={deleteReceipt}>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {receipt ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Receipt Image */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={receipt.file_url} 
                      alt="Receipt" 
                      className="w-full h-auto rounded-lg"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Receipt Details */}
              <div>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Receipt Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Uploaded</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(receipt.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {receipt.merchant && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Merchant</h3>
                        <p className="mt-1 text-sm text-gray-900">{receipt.merchant}</p>
                      </div>
                    )}
                    
                    {receipt.amount && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                        <p className="mt-1 text-sm text-gray-900">${receipt.amount.toFixed(2)}</p>
                      </div>
                    )}
                    
                    {receipt.category && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Category</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {receipt.category}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">File ID</h3>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{receipt.id}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm mt-6">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button variant="outline" className="w-full">
                      Link to Transaction
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Receipt not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The receipt you are looking for does not exist or has been deleted.
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push('/receipts')}>
                  Back to Receipts
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}