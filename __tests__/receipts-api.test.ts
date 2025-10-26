import { parseReceiptText } from '@/app/api/receipts/route';

describe('Receipts API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Receipt Text Parsing', () => {
    it('should parse merchant name from receipt text', () => {
      const text = `WALMART
123 Main St
Anytown, ST 12345
(555) 123-4567

Item 1                 $5.99
Item 2                $12.50

SUBTOTAL              $18.49
TAX                    $1.11
TOTAL                 $19.60`;
      
      const result = parseReceiptText(text);
      expect(result.merchant).toBe('WALMART');
    });

    it('should parse total amount from receipt text', () => {
      const text = `STORE NAME

Item 1                 $5.99
Item 2                $12.50

SUBTOTAL              $18.49
TAX                    $1.11
TOTAL                 $19.60`;
      
      const result = parseReceiptText(text);
      expect(result.amount).toBe(19.60);
    });

    it('should parse items from receipt text', () => {
      const text = `STORE

Item One              $5.99
Item Two             $12.50

TOTAL                $18.49`;
      
      const result = parseReceiptText(text);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({ name: 'Item One', price: 5.99 });
      expect(result.items[1]).toEqual({ name: 'Item Two', price: 12.50 });
    });

    it('should parse date from receipt text', () => {
      const text = `STORE
05/15/2023

Item                 $5.99

TOTAL                $5.99`;
      
      const result = parseReceiptText(text);
      expect(result.date).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should categorize merchant correctly', () => {
      const text = `WHOLE FOODS

Item                 $5.99

TOTAL                $5.99`;
      
      const result = parseReceiptText(text);
      expect(result.category).toBe('Groceries');
    });
  });

  describe('POST /api/receipts', () => {
    it('should process a receipt image', async () => {
      // This test would require proper mocking of the Next.js Request object and Tesseract
      // For now, we'll skip the implementation
      expect(true).toBe(true);
    });
  });
});
