import { NextResponse } from 'next/server';

// This is a test route to verify R2 storage connectivity
// In a real Cloudflare Pages Functions environment, you would access R2 through context.env.R2_BUCKET
export const dynamic = 'force-static';

export async function GET() {
  try {
    // This is a placeholder response since we can't actually connect to R2 in this environment
    // In a real implementation, you would use:
    // const r2 = new R2Storage(context.env.R2_BUCKET, 'budgetwise-storage');
    // And then perform R2 operations
    
    return NextResponse.json({
      success: true,
      message: 'R2 storage integration ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('R2 test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to R2 storage',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}