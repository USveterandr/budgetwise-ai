import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Trash2, 
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import CameraCapture from "./CameraCapture";

const API = `${(process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '') : '')}/api`;

const ReceiptGallery = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/uploads/receipts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceipts(response.data);
    } catch (error) {
      toast.error("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (receiptId, filename) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/uploads/receipt/${receiptId}/file`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  const deleteReceipt = async (receiptId) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/uploads/receipt/${receiptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReceipts(receipts.filter(r => r.id !== receiptId));
      toast.success("Receipt deleted successfully");
    } catch (error) {
      toast.error("Failed to delete receipt");
    }
  };

  const handleReceiptUploaded = () => {
    fetchReceipts();
    setShowCamera(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="h-8 w-8 text-violet-600" />
          </div>
          <p className="text-gray-600">Loading your receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📁 Receipt Gallery
            </h1>
            <p className="text-gray-600">
              Manage your uploaded receipts and documents
            </p>
          </div>
          <Button
            onClick={() => setShowCamera(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Receipt
          </Button>
        </div>

        {/* Receipts Grid */}
        {receipts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {receipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {receipt.file_type === 'pdf' ? (
                        <FileText className="h-5 w-5 text-red-600" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                      )}
                      <CardTitle className="text-sm truncate">
                        {receipt.filename}
                      </CardTitle>
                    </div>
                    <Badge variant={receipt.is_processed ? "default" : "secondary"}>
                      {receipt.is_processed ? "Processed" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* File Info */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(receipt.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        <span>{formatFileSize(receipt.file_size)}</span>
                      </div>
                      {receipt.amount_extracted && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3" />
                          <span>${receipt.amount_extracted.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReceipt(receipt.id, receipt.filename)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReceipt(receipt.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No receipts uploaded yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by capturing receipts with your camera or uploading existing images and PDFs to track your expenses.
            </p>
            <Button
              onClick={() => setShowCamera(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Receipt
            </Button>
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CameraCapture 
            onExpenseCreated={handleReceiptUploaded}
            onClose={() => setShowCamera(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ReceiptGallery;