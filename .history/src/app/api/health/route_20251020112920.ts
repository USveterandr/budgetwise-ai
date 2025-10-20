import { NextResponse } from 'next/server';

// Make this route static for export
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}