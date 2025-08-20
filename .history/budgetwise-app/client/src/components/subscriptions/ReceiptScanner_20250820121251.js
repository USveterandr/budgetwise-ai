import React, { useState, useRef } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import './ReceiptScanner.css';

const ReceiptScanner = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { addTransaction } = useTransactions();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Please select an image under 5MB.');
        return;
      }
      
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setOcrResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Please select an image under 5MB.');
        return;
      }
      
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setOcrResult(null);
    } else {
      setError('Please drop an image file.');
    }
  };

  const handleScanReceipt = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In a real app, this would send the image to your OCR API
      // For now, we'll simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR result
      const mockOcrResult = {
        merchant: 'Walmart',
        date: new Date().toISOString().split('T')[0],
        total: 86.42,
        items: [
          { name: 'Groceries', amount: 65.30 },
          { name: 'Household Items', amount: 21.12 }
        ]
      };
      
      setOcrResult(mockOcrResult);
    } catch (err) {
      setError('Failed to process receipt. Please try again.');
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!ocrResult) return;

    try {
      const transactionData = {
        description: ocrResult.merchant,
        amount: ocrResult.total,
        date: ocrResult.date,
        category: 'Shopping', // This would ideally be determined by the OCR
        type: 'expense'
      };

      await addTransaction(transactionData);
      alert('Transaction added successfully!');
      
      // Reset form
      setImage(null);
      setPreviewUrl(null);
      setOcrResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
      console.error('Error saving transaction:', err);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="receipt-scanner">
      <h2>Receipt Scanner</h2>
      <p>Scan your receipts to automatically add transactions</p>
      
      {!previewUrl ? (
        <div 
          className="drop-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-content">
            <span className="upload-icon">📷</span>
            <p>Drag & drop your receipt here</p>
            <p>or</p>
            <button className="browse-btn">Browse Files</button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="preview-area">
          <div className="image-preview">
            <img src={previewUrl} alt="Receipt preview" />
          </div>
          
          {isProcessing ? (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Processing receipt...</p>
            </div>
          ) : ocrResult ? (
            <div className="ocr-result">
              <h3>Receipt Details</h3>
              <div className="receipt-details">
                <p><strong>Merchant:</strong> {ocrResult.merchant}</p>
                <p><strong>Date:</strong> {ocrResult.date}</p>
                <p><strong>Total:</strong> ${ocrResult.total.toFixed(2)}</p>
                <div className="items-list">
                  <h4>Items:</h4>
                  {ocrResult.items.map((item, index) => (
                    <div key={index} className="item">
                      <span>{item.name}</span>
                      <span>${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="action-buttons">
                <button onClick={handleSaveTransaction} className="save-btn">
                  Save Transaction
                </button>
                <button onClick={handleRetake} className="retake-btn">
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <div className="scan-button-container">
              <button 
                onClick={handleScanReceipt} 
                className="scan-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Scan Receipt'}
              </button>
              <button onClick={handleRetake} className="retake-btn">
                Retake
              </button>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;