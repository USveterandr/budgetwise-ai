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
