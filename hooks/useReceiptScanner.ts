import { useState } from 'react';
import { ReceiptData } from '../utils/ocrUtils';

export interface UseReceiptScannerResult {
  showScanner: boolean;
  setShowScanner: (show: boolean) => void;
  scannerTransaction: ReceiptData | null;
  setScannerTransaction: (transaction: ReceiptData | null) => void;
  handleReceiptScan: (data: ReceiptData) => void;
  handleScannerCancel: () => void;
}

export function useReceiptScanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTransaction, setScannerTransaction] = useState<ReceiptData | null>(null);

  const handleReceiptScan = (data: ReceiptData) => {
    setScannerTransaction(data);
    setShowScanner(false);
  };

  const handleScannerCancel = () => {
    setShowScanner(false);
    setScannerTransaction(null);
  };

  return {
    showScanner,
    setShowScanner,
    scannerTransaction,
    setScannerTransaction,
    handleReceiptScan,
    handleScannerCancel
  };
}