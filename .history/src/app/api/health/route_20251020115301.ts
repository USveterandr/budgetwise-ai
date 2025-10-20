import { NextResponse } from 'next/server';

// Make this route static for export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}