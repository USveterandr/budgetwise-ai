// @ts-nocheck
import { renderHook, act } from '@testing-library/react-native';
import { useReceiptScanner } from '../hooks/useReceiptScanner';

describe('useReceiptScanner', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useReceiptScanner());
    
    expect(result.current.showScanner).toBe(false);
    expect(result.current.scannerTransaction).toBeNull();
  });

  it('should toggle scanner visibility', () => {
    const { result } = renderHook(() => useReceiptScanner());
    
    act(() => {
      result.current.setShowScanner(true);
    });
    
    expect(result.current.showScanner).toBe(true);
  });

  it('should handle receipt scan', () => {
    const { result } = renderHook(() => useReceiptScanner());
    const mockReceiptData = {
      description: 'Test Store',
      amount: 12.70,
      category: 'Shopping',
      date: '2025-12-04'
    };
    
    act(() => {
      result.current.handleReceiptScan(mockReceiptData);
    });
    
    expect(result.current.scannerTransaction).toEqual(mockReceiptData);
    expect(result.current.showScanner).toBe(false);
  });

  it('should handle scanner cancellation', () => {
    const { result } = renderHook(() => useReceiptScanner());
    
    // Set some initial state
    act(() => {
      result.current.setShowScanner(true);
    });
    
    act(() => {
      result.current.handleScannerCancel();
    });
    
    expect(result.current.showScanner).toBe(false);
    expect(result.current.scannerTransaction).toBeNull();
  });
});