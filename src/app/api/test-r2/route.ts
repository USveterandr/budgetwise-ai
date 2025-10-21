import { NextResponse } from 'next/server';

// This is a test route to verify R2 storage connectivity through our database worker
export const dynamic = 'force-static';

export async function GET() {
  try {
    // Call our database worker to test R2 connectivity
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/test-r2');
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'R2 storage integration ready',
      workerResponse: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('R2 test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to R2 storage through worker',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}