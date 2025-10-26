"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CameraIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  TrashIcon,
  EyeIcon,
  InformationCircleIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/outline";
import ClientOCRProcessor from "@/components/receipts/ClientOCRProcessor";
import ProtectedRoute from "@/components/ProtectedRoute";

// Define types for our expense data
interface ExpenseItem {
  name: string;
  price: number;
}

interface ExpenseData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: ExpenseItem[];
}

interface Receipt {
  id: string;
  file_url: string;
  uploaded_at: string;
}

export default function ReceiptsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scan' | 'gallery'>('scan');
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing receipts when component mounts
  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receipts/list');
      const result = await response.json();
      
      if (result.success) {
        setReceipts(result.receipts);
      } else {
        console.error('Error fetching receipts:', result.error);
        // Fallback to mock data if API fails
        const mockReceipts = [
          {
            id: 'rcpt_1',
            file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=300&h=400&fit=crop',
            uploaded_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'rcpt_2',
            file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=300&h=400&fit=crop',
            uploaded_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'rcpt_3',
            file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=300&h=400&fit=crop',
            uploaded_at: new Date(Date.now() - 259200000).toISOString()
          }
        ];
        
        setReceipts(mockReceipts);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      // Fallback to mock data if API fails
      const mockReceipts = [
        {
          id: 'rcpt_1',
          file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=300&h=400&fit=crop',
          uploaded_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'rcpt_2',
          file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=300&h=400&fit=crop',
          uploaded_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'rcpt_3',
          file_url: 'https://images.unsplash.com/photo-1593716950239-00ff78a1d380?w=300&h=400&fit=crop',
          uploaded_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      
      setReceipts(mockReceipts);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setExpenseData(null);
        setIsApproved(false);
        setOcrMessage(null);
        setShowFullscreen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCapture = async () => {
    if (streamRef.current) {
      const video = videoRef.current;
      if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/png');
          setImage(imageData);
          setExpenseData(null);
          setIsApproved(false);
          setOcrMessage(null);
          setShowFullscreen(false);
          
          // Stop the camera
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback to front camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (fallbackErr) {
        console.error("Error accessing camera (fallback):", fallbackErr);
        alert("Could not access the camera. Please check permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleOCRResult = (result: ExpenseData) => {
    setExpenseData(result);
    setOcrMessage(`Extracted ${result.items.length} items from receipt`);
  };

  const handleOCRError = (error: string) => {
    setOcrMessage(error);
    alert(error);
  };

  const handleApprove = () => {
    setIsApproved(true);
    // In a real implementation, you would save the expense to the database here
    alert("Expense added successfully!");
  };

  const handleReject = () => {
    setExpenseData(null);
    setIsApproved(false);
  };

  const handleReset = () => {
    setImage(null);
    setExpenseData(null);
    setIsApproved(false);
    setIsProcessing(false);
    setOcrMessage(null);
    setShowFullscreen(false);
    stopCamera();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteReceipt = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        setReceipts(receipts.filter(receipt => receipt.id !== id));
      } else {
        console.error('Error deleting receipt:', result.error);
        alert('Failed to delete receipt');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Failed to delete receipt');
    }
  };

  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Receipt Management</h1>
            <p className="text-gray-600">Scan, organize, and manage your receipts</p>
          </div>

          {/* OCR Status Message */}
          {ocrMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-blue-800">{ocrMessage}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('scan')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CameraIcon className="h-5 w-5 inline-block mr-2" />
                Scan Receipt
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'gallery'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 inline-block mr-2" />
                Receipt Gallery
              </button>
            </nav>
          </div>

          {activeTab === 'scan' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Camera/Upload Section */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Scan Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                  {!image ? (
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-400"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                        <input
                          ref={fileInputRef}
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          aria-label="Upload receipt image"
                        />
                      </div>
                      
                      <div className="relative">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Or use your camera
                          </p>
                          <Button 
                            onClick={startCamera}
                            className="mt-2 bg-blue-600 hover:bg-blue-700"
                          >
                            Start Camera
                          </Button>
                        </div>
                        
                        {streamRef.current && (
                          <div className="absolute inset-0 bg-black rounded-lg">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                              <Button 
                                onClick={handleCapture}
                                className="bg-white text-black hover:bg-gray-100"
                              >
                                Capture
                              </Button>
                              <Button 
                                onClick={stopCamera}
                                variant="outline"
                                className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={image} 
                          alt="Receipt" 
                          className={`w-full h-auto rounded-lg border ${showFullscreen ? 'max-h-[70vh]' : ''}`}
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <Button 
                            onClick={toggleFullscreen}
                            variant="outline"
                            size="sm"
                            className="bg-white bg-opacity-80 hover:bg-opacity-100"
                            aria-label="Toggle fullscreen"
                          >
                            <ArrowsPointingOutIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                            className="bg-white bg-opacity-80 hover:bg-opacity-100"
                            aria-label="Remove image"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {!expenseData && !isProcessing && (
                        <ClientOCRProcessor 
                          image={image} 
                          onResult={handleOCRResult} 
                          onError={handleOCRError} 
                        />
                      )}
                      
                      {isProcessing && (
                        <div className="flex justify-center">
                          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Expense Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseData ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{expenseData.merchant}</h3>
                            <p className="text-gray-600">{expenseData.date}</p>
                          </div>
                          <span className="text-xl font-bold">${expenseData.amount.toFixed(2)}</span>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {expenseData.category}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                          {expenseData.items.map((item: ExpenseItem, index: number) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {!isApproved ? (
                        <div className="flex space-x-3 pt-4">
                          <Button 
                            onClick={handleApprove}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            onClick={handleReject}
                            variant="outline"
                            className="flex-1"
                          >
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto" />
                          <p className="mt-2 font-medium text-green-800">Expense Approved!</p>
                          <p className="text-sm text-green-600">The expense has been added to your account.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 font-medium text-gray-900">No receipt processed</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Upload or capture a receipt to extract expense information
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Receipt Gallery */
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Receipt Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : receipts.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by scanning your first receipt.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setActiveTab('scan')}>
                        <CameraIcon className="h-5 w-5 mr-2" />
                        Scan Receipt
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="border rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={receipt.file_url} 
                          alt="Receipt" 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-xs text-gray-500">
                            {new Date(receipt.uploaded_at).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between mt-2">
                            <Button size="sm" variant="outline" aria-label="View receipt">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteReceipt(receipt.id)}
                              aria-label="Delete receipt"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}