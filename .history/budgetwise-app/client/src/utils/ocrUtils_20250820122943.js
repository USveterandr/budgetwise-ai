// ocrUtils.js
import api from '../services/api';

export const processReceiptImage = async (imageFile) => {
  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);
    
    // Send to OCR API
    const response = await api.post('/receipts/process', {
      image: base64Image,
      fileName: imageFile.name
    });
    
    return response.data;
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to process receipt image');
  }
};

export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
    reader.onerror = error => reject(error);
  });
};

export const extractTransactionData = (ocrText) => {
  // Simple regex patterns to extract data
  const amountPattern = /\$?(\d+(?:\.\d{2})?)/g;
  const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}-\d{1,2}-\d{2,4})/g;
  const merchantPattern = /(?:store|market|shop|restaurant)\s*(.*?)(?=\s*(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\$?\d))/gi;
  
  const amounts = ocrText.match(amountPattern) || [];
  const dates = ocrText.match(datePattern) || [];
  const merchants = ocrText.match(merchantPattern) || [];
  
  // Find the highest amount as total
  const total = amounts.length > 0 
    ? Math.max(...amounts.map(a => parseFloat(a.replace('$', ''))))
    : 0;
  
  return {
    merchant: merchants.length > 0 ? merchants[0].trim() : 'Unknown Merchant',
    date: dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0],
    total: total,
    items: extractLineItems(ocrText)
  };
};

const extractLineItems = (text) => {
  // Simple line item extraction
  const lines = text.split('\n');
  const items = [];
  
  for (const line of lines) {
    // Look for patterns like "Item Name $10.99"
    const itemPattern = /(.*?)\s*\$?(\d+(?:\.\d{2})?)/;
    const match = line.match(itemPattern);
    
    if (match && match[2]) {
      const name = match[1].trim();
      const price = parseFloat(match[2]);
      
      // Only include if it looks like a real item (not just a number)
      if (name && name.length > 2 && !isNaN(price)) {
        items.push({ name, price });
      }
    }
  }
  
  return items;
};

export const validateReceipt = (ocrData) => {
  // Basic validation checks
  if (!ocrData.merchant || ocrData.merchant === 'Unknown Merchant') {
    return false;
  }
  
  if (!ocrData.total || ocrData.total <= 0) {
    return false;
  }
  
  if (!ocrData.date) {
    return false;
  }
  
  return true;
};