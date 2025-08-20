import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './OCRProcessor.css';

const OCRProcessor = ({ image, onProcessComplete, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image]);

  const processImage = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      // In a real app, this would send the image to your OCR API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setProgress(100);
      
      // Mock OCR result
      const ocrResult = {
        merchant: 'Walmart',
        date: new Date().toISOString().split('T')[0],
        total: 86.42,
        items: [
          { name: 'Groceries', amount: 65.30, category: 'Food & Dining' },
          { name: 'Household Items', amount: 21.12, category: 'Home' }
        ],
        tax: 7.25,
        currency: 'USD'
      };
      
      // Add a small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onProcessComplete(ocrResult);
    } catch (error) {
      console.error('OCR processing error:', error);
      onError('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelProcessing = () => {
    setIsProcessing(false);
    onProcessComplete(null);
  };

  if (!image) {
    return null;
  }

  return (
    <div className="ocr-processor">
      <div className="processing-overlay">
        <div className="processing-content">
          <h3>Processing Receipt</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
          <p>Extracting transaction details...</p>
          <button 
            onClick={cancelProcessing} 
            className="cancel-btn"
            disabled={progress === 100}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OCRProcessor;