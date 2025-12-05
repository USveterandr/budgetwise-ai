import { parseReceiptText, formatDate, categorizeReceipt } from '../utils/ocrUtils';

describe('ocrUtils', () => {
  describe('parseReceiptText', () => {
    it('extracts amount from receipt text', () => {
      const text = 'TOTAL: $12.70';
      const result = parseReceiptText(text);
      expect(result.amount).toBe(12.70);
    });

    it('extracts date from receipt text', () => {
      const text = 'Date: 12/04/2025';
      const result = parseReceiptText(text);
      expect(result.date).toBe('2025-12-04');
    });

    it('uses current date when no date found', () => {
      const text = 'Some receipt without date';
      const result = parseReceiptText(text);
      const today = new Date().toISOString().split('T')[0];
      expect(result.date).toBe(today);
    });

    it('categorizes receipt based on keywords', () => {
      const text = 'GROCERY STORE MARKET';
      const result = parseReceiptText(text);
      expect(result.category).toBe('Shopping');
    });
  });

  describe('formatDate', () => {
    it('formats MM/DD/YYYY correctly', () => {
      const result = formatDate('12/04/2025');
      expect(result).toBe('2025-12-04');
    });

    it('formats M/D/YY correctly', () => {
      const result = formatDate('1/4/25');
      expect(result).toBe('2025-01-04');
    });
  });

  describe('categorizeReceipt', () => {
    it('categorizes food receipts', () => {
      const result = categorizeReceipt('RESTAURANT CAFE FOOD');
      expect(result).toBe('Food');
    });

    it('categorizes transportation receipts', () => {
      const result = categorizeReceipt('GAS FUEL STATION');
      expect(result).toBe('Transportation');
    });

    it('categorizes shopping receipts', () => {
      const result = categorizeReceipt('WALMART GROCERY MARKET');
      expect(result).toBe('Shopping');
    });

    it('defaults to Other category', () => {
      const result = categorizeReceipt('RANDOM RECEIPT TEXT');
      expect(result).toBe('Other');
    });
  });
});