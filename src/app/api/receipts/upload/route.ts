import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { R2Storage, R2Bucket } from '@/lib/r2';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Mock R2 bucket for demonstration
const mockR2Bucket: R2Bucket = {
  put: async (_key: string, value: ArrayBuffer) => {
    // In a real implementation, this would upload to Cloudflare R2
    console.log(`Uploading file to R2`);
    return {
      key: 'mock-key',
      size: value.byteLength,
      etag: 'mock-etag'
    };
  },
  get: async (_key: string) => {
    // Mock implementation
    return null;
  },
  delete: async (_key: string) => {
    // Mock implementation
    return;
  },
  list: async (_options?: { prefix?: string; limit?: number }) => {
    // Mock implementation
    return {
      objects: [],
      truncated: false
    };
  }
};

const r2Storage = new R2Storage(mockR2Bucket, 'mock-bucket');

export async function POST(_request: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, you would:
    // 1. Parse the multipart form data
    // 2. Extract the file
    // 3. Validate the file type and size
    // 4. Upload to R2
    // 5. Save receipt record to database
    
    // For demo purposes, we'll return mock data
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileKey = `receipts/${receiptId}.jpg`;
    const fileUrl = r2Storage.getFileUrl(fileKey);
    
    // Mock receipt data
    const receiptData = {
      id: receiptId,
      user_id: user.id,
      transaction_id: null,
      file_key: fileKey,
      file_url: fileUrl,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true,
      receipt: receiptData,
      message: 'Receipt uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}