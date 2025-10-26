import { parseReceiptText } from '../src/app/api/receipts/route';

// Mock the Next.js and Tesseract imports
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data)
    }))
  }
}));

jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
  createWorker: jest.fn(),
  PSM: {
    SINGLE_BLOCK: '6'
  }
}));

describe('Receipt Text Parsing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should handle empty or invalid text', () => {
    const text = ``;
    
    const result = parseReceiptText(text);
    expect(result.merchant).toBe('Unknown Merchant');
    expect(result.amount).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it('should sum items when total not found', () => {
    const text = `STORE

Item One              $5.99
Item Two             $12.50

SUBTOTAL             $18.49`;
    
    const result = parseReceiptText(text);
    expect(result.amount).toBe(18.49);
  });
});