import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReceiptsPage from '@/app/receipts/page';
import ReceiptDetailPage from '@/app/receipts/[id]/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({
    id: 'test-receipt-id',
  }),
}));

// Mock ProtectedRoute component
jest.mock('@/components/ProtectedRoute', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// Mock ClientOCRProcessor component
jest.mock('@/components/receipts/ClientOCRProcessor', () => {
  return {
    __esModule: true,
    default: ({ onResult }: { onResult: (data: { merchant: string; amount: number; date: string; category: string; items: { name: string; price: number }[] }) => void }) => (
      <div>
        <button 
          onClick={() => onResult({
            merchant: 'Test Merchant',
            amount: 25.99,
            date: '2023-05-15',
            category: 'Groceries',
            items: [{ name: 'Item 1', price: 10.99 }, { name: 'Item 2', price: 15.00 }]
          })}
          data-testid="mock-ocr-processor"
        >
          Process Receipt
        </button>
      </div>
    ),
  };
});

describe('Receipts Management', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Receipts Page', () => {
    it('renders the receipts page with scan and gallery tabs', () => {
      render(<ReceiptsPage />);
      
      expect(screen.getByText('Receipt Management')).toBeInTheDocument();
      expect(screen.getByText('Scan Receipt')).toBeInTheDocument();
      expect(screen.getByText('Receipt Gallery')).toBeInTheDocument();
    });

    it('allows switching between scan and gallery tabs', () => {
      render(<ReceiptsPage />);
      
      // Initially on scan tab
      expect(screen.getByText('Scan Receipt')).toBeInTheDocument();
      
      // Switch to gallery tab
      const galleryTab = screen.getByText('Receipt Gallery');
      fireEvent.click(galleryTab);
      
      // Should show gallery content
      expect(screen.getByText('Receipt Gallery')).toBeInTheDocument();
    });

    it('handles file upload', () => {
      render(<ReceiptsPage />);
      
      // Mock file
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      // Get the file input element
      const fileInput = screen.getByLabelText('Upload receipt image');
      
      // Simulate file upload
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Should show the uploaded image
      expect(screen.getByAltText('Receipt')).toBeInTheDocument();
    });

    it('processes receipt with OCR and displays results', async () => {
      render(<ReceiptsPage />);
      
      // Mock file upload
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByLabelText('Upload receipt image');
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Click the OCR processor button
      const processButton = screen.getByTestId('mock-ocr-processor');
      fireEvent.click(processButton);
      
      // Should display the processed results
      await waitFor(() => {
        expect(screen.getByText('Test Merchant')).toBeInTheDocument();
        expect(screen.getByText('$25.99')).toBeInTheDocument();
      });
    });
  });

  describe('Receipt Detail Page', () => {
    it('renders receipt detail page', () => {
      render(<ReceiptDetailPage />);
      
      expect(screen.getByText('Receipt Details')).toBeInTheDocument();
      expect(screen.getByText('Back to Receipts')).toBeInTheDocument();
    });

    it('displays receipt information', async () => {
      render(<ReceiptDetailPage />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Whole Foods Market')).toBeInTheDocument();
        expect(screen.getByText('$86.42')).toBeInTheDocument();
      });
    });
  });
});