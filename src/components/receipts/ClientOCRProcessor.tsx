"use client";

import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface OCRResult {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: { name: string; price: number }[];
}

interface ClientOCRProcessorProps {
  image: string;
  onResult: (result: OCRResult) => void;
  onError: (error: string) => void;
}

export default function ClientOCRProcessor({ image, onResult, onError }: ClientOCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to process");

  const processReceipt = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatus("Starting OCR processing...");
    
    try {
      // Create a worker with specific configuration for better receipt processing
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatus(`Processing: ${Math.round(m.progress * 100)}%`);
          } else {
            setStatus(m.status || "Processing...");
          }
        }
      });
      
      // Set worker parameters for better receipt text recognition
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1'
      });
      
      // Process the image
      const result = await worker.recognize(image);
      await worker.terminate();
      
      // Extract text from the result
      const ocrText = result.data.text;
      setStatus("Parsing extracted text...");
      
      // Parse the OCR text to extract receipt information
      const parsedData = parseReceiptText(ocrText);
      
      setStatus("Processing complete!");
      onResult(parsedData);
    } catch (_error) {  // Fixed unused variable
      console.error("Error processing receipt:", _error);
      setStatus("OCR processing failed");
      onError("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced function to parse receipt text
  function parseReceiptText(text: string): OCRResult {
    // Clean up the text
    const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const lines = cleanedText.split('\n').filter(line => line.trim() !== '').slice(0, 100); // Limit to 100 lines
    
    // Try to find merchant name (usually at the top)
    let merchant = "Unknown Merchant";
    
    // Look for merchant in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      // Skip lines that look like dates, amounts, or totals
      if (!line.match(/\d+\.\d{2}/) && !line.match(/(TOTAL|SUBTOTAL|TAX|CHANGE|CASH|CARD|CREDIT|DEBIT|BALANCE|DUE)/i)) {
        merchant = line;
        break;
      }
    }
    
    // Try to find total amount (look for patterns like TOTAL, TOTAL AMOUNT, etc.)
    let amount = 0.00;
    
    // First pass: look for "TOTAL" specifically (prioritize over SUBTOTAL)
    const totalRegex = /(\bTOTAL\b|\bTOTAL AMOUNT\b|\bGRAND TOTAL\b).*?(\$?\s*\d+\.\d{2})/i;
    for (const line of lines) {
      const match = line.match(totalRegex);
      if (match) {
        const amountStr = match[2].replace(/[^\d.]/g, '');
        amount = parseFloat(amountStr);
        break;
      }
    }
    
    // Second pass: if no total found, look for other total-like patterns
    if (amount === 0.00) {
      const otherTotalRegex = /(AMOUNT|SUBTOTAL|BALANCE|DUE).*?(\$?\s*\d+\.\d{2})/i;
      for (const line of lines) {
        const match = line.match(otherTotalRegex);
        if (match) {
          const amountStr = match[2].replace(/[^\d.]/g, '');
          amount = parseFloat(amountStr);
          break;
        }
      }
    }
    
    // Second pass: if no total found, look for the highest amount
    if (amount === 0.00) {
      const amountRegex = /\$?\s*(\d+\.\d{2})/g;
      let maxAmount = 0;
      let match;
      while ((match = amountRegex.exec(cleanedText)) !== null) {
        const value = parseFloat(match[1]);
        if (value > maxAmount) {
          maxAmount = value;
        }
      }
      amount = maxAmount;
    }
    
    // Try to find date (look for common date patterns)
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
    let date = new Date().toISOString().split('T')[0];
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        // Try to parse the date
        try {
          const parsedDate = new Date(match[1]);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (_e) {  // Fixed unused variable
          // If parsing fails, use the raw match
          date = match[1];
          break;
        }
      }
    }
    
    // Try to extract items (this is enhanced)
    const items: { name: string; price: number }[] = [];
    
    // Look for item lines (items usually have a name followed by a price)
    const itemRegex = /^(.+?)\s+(\$?\s*\d+\.\d{2})$/;
    
    for (const line of lines) {
      // Skip lines that are likely not items
      if (line.match(/^(TOTAL|SUBTOTAL|TAX|CHANGE|CASH|CARD|CREDIT|DEBIT|BALANCE|DUE|SALE|VOID|REFUND|RETURN)/i)) {
        continue;
      }
      
      const match = line.match(itemRegex);
      if (match && items.length < 20) { // Limit to 20 items
        const itemName = match[1].trim();
        const priceStr = match[2].replace(/[^\d.]/g, '');
        const price = parseFloat(priceStr);
        
        // Only add items with valid names and prices
        if (itemName.length > 1 && !isNaN(price) && price > 0) {
          items.push({
            name: itemName,
            price: price
          });
        }
      }
    }
    
    // If we didn't find a total amount but have items, sum the items
    if (amount === 0.00 && items.length > 0) {
      amount = items.reduce((sum, item) => sum + item.price, 0);
    }
    
    return {
      merchant,
      amount,
      date,
      category: categorizeMerchant(merchant),
      items
    };
  }

  // Simple merchant categorization
  function categorizeMerchant(merchant: string): string {
    const merchantLower = merchant.toLowerCase();
    
    if (merchantLower.includes('whole foods') || merchantLower.includes('grocery') || merchantLower.includes('market')) {
      return 'Groceries';
    } else if (merchantLower.includes('starbucks') || merchantLower.includes('coffee')) {
      return 'Food & Dining';
    } else if (merchantLower.includes('shell') || merchantLower.includes('gas') || merchantLower.includes('petrol')) {
      return 'Gas & Fuel';
    } else if (merchantLower.includes('amazon') || merchantLower.includes('online')) {
      return 'Shopping';
    } else if (merchantLower.includes('walgreens') || merchantLower.includes('cvs') || merchantLower.includes('pharmacy')) {
      return 'Healthcare';
    } else if (merchantLower.includes('mcdonald') || merchantLower.includes('burger king') || merchantLower.includes('restaurant')) {
      return 'Food & Dining';
    } else {
      return 'Miscellaneous';
    }
  }

  return (
    <div className="space-y-4">
      {!isProcessing ? (
        <Button 
          onClick={processReceipt}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Process Receipt with OCR
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{status}</span>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-center">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}