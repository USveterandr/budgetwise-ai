import { NextResponse } from 'next/server';

// This is a test route to verify D1 database connectivity through our database worker
export const dynamic = 'force-static';

export async function GET() {
  try {
    // Call our database worker to test D1 connectivity
    const response = await fetch('https://budgetwise-database-worker.isaactrinidadllc.workers.dev/test-db');
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'D1 database integration ready',
      workerResponse: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('D1 test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to D1 database through worker',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}