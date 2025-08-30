import React, { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { 
  Camera, 
  Upload, 
  FileText, 
  X, 
  Check,
  Loader2,
  Image as ImageIcon,
  Receipt,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CameraCapture = ({ onExpenseCreated, onClose }) => {
  const [currentStep, setCurrentStep] = useState("upload"); // upload, preview, expense
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [expenseData, setExpenseData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const categories = [
    "Food & Dining",
    "Shopping",
    "Transportation", 
    "Bills & Utilities",
    "Entertainment",
    "Healthcare",
    "Travel",
    "Education",
    "Business",
    "Other"
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Cannot access camera. Please use file upload instead.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedImage(URL.createObjectURL(blob));
        setUploadedFile(file);
        setCurrentStep("preview");
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPG, PNG, HEIC, WEBP) or PDF");
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB");
        return;
      }
      
      setUploadedFile(file);
      
      if (file.type === 'application/pdf') {
        setCapturedImage(null);
      } else {
        setCapturedImage(URL.createObjectURL(file));
      }
      
      setCurrentStep("preview");
    }
  };

  const uploadReceipt = async () => {
    if (!uploadedFile) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('description', 'Receipt upload from camera/file');
      
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API}/uploads/receipt`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setReceiptId(response.data.receipt_id);
      setCurrentStep("expense");
      toast.success("Receipt uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload receipt");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const createExpenseFromReceipt = async () => {
    if (!receiptId) return;
    
    setCreatingExpense(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/uploads/receipt/${receiptId}/create-expense`,
        {
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          description: expenseData.description,
          date: new Date(expenseData.date).toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success("Expense created successfully from receipt!");
      
      if (onExpenseCreated) {
        onExpenseCreated(response.data.expense);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast.error("Failed to create expense");
      console.error(error);
    } finally {
      setCreatingExpense(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setReceiptId(null);
    setCurrentStep("upload");
    setExpenseData({
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    stopCamera();
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Capture Receipt
        </h3>
        <p className="text-gray-600 mb-6">
          Take a photo of your receipt or upload an existing image/PDF
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Option */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={startCamera}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Camera className="h-6 w-6 text-violet-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Use Camera</h4>
            <p className="text-sm text-gray-600">Take a photo with your camera</p>
          </CardContent>
        </Card>
        
        {/* File Upload Option */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => fileInputRef.current?.click()}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Upload File</h4>
            <p className="text-sm text-gray-600">Choose from your device</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Camera View */}
      {cameraActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
            style={{ maxHeight: '400px' }}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
            <Button
              onClick={capturePhoto}
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-16 h-16"
            >
              <Camera className="h-6 w-6" />
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              className="bg-white hover:bg-gray-100 rounded-full w-12 h-12"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review Receipt
        </h3>
        <p className="text-gray-600 mb-4">
          Confirm your receipt image looks good before uploading
        </p>
      </div>
      
      <div className="flex justify-center">
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Receipt preview" 
            className="max-w-full max-h-80 rounded-lg shadow-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">PDF file selected</p>
              <p className="text-sm text-gray-400">{uploadedFile?.name}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 justify-center">
        <Button
          onClick={resetCapture}
          variant="outline"
        >
          Retake
        </Button>
        <Button
          onClick={uploadReceipt}
          disabled={uploading}
          className="bg-gradient-to-r from-violet-500 to-purple-500"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderExpenseStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Create Expense
        </h3>
        <p className="text-gray-600 mb-4">
          Fill in the expense details from your receipt
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={expenseData.amount}
            onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={expenseData.category} onValueChange={(value) => setExpenseData({...expenseData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description"
            value={expenseData.description}
            onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={expenseData.date}
            onChange={(e) => setExpenseData({...expenseData, date: e.target.value})}
          />
        </div>
      </div>
      
      <div className="flex gap-3 justify-end">
        <Button
          onClick={resetCapture}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={createExpenseFromReceipt}
          disabled={!expenseData.amount || !expenseData.category || creatingExpense}
          className="bg-gradient-to-r from-violet-500 to-purple-500"
        >
          {creatingExpense ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Receipt className="mr-2 h-4 w-4" />
              Create Expense
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
          <CardDescription>
            Capture or upload receipts to track expenses quickly
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            {["upload", "preview", "expense"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-violet-500 text-white' 
                    : index < ["upload", "preview", "expense"].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < ["upload", "preview", "expense"].indexOf(currentStep) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < ["upload", "preview", "expense"].indexOf(currentStep) 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        {currentStep === "upload" && renderUploadStep()}
        {currentStep === "preview" && renderPreviewStep()}
        {currentStep === "expense" && renderExpenseStep()}
      </CardContent>
    </Card>
  );
};

export default CameraCapture;