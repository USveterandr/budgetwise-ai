import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Add this to make the route compatible with static export
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
