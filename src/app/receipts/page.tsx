"use client";

import React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CameraIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
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

export default function ReceiptsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
          
          // Stop the camera
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const processImage = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    try {
      // Send image to API for processing
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setExpenseData(result.data);
      } else {
        throw new Error(result.error || 'Failed to process receipt');
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      alert("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
    stopCamera();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Receipt Scanner</h1>
            <p className="text-gray-600">Scan your receipts to automatically add expenses</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera/Upload Section */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Scan Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                {!image ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Upload a photo of your receipt
                      </p>
                      <label htmlFor="receipt-upload" className="mt-2 block w-full">
                        <span className="sr-only">Choose receipt image</span>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </label>
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
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <Button 
                              onClick={handleCapture}
                              className="bg-white text-black hover:bg-gray-100"
                            >
                              Capture
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
                        className="w-full h-auto rounded-lg border"
                      />
                      <Button 
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {!expenseData && !isProcessing && (
                      <Button 
                        onClick={processImage}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Process Receipt
                      </Button>
                    )}
                  </div>
                )}
                
                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-2 text-gray-600">Processing receipt...</p>
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
                      <ul className="space-y-2">
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
        </div>
      </div>
    </ProtectedRoute>
  );
}