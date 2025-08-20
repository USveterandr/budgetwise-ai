import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import GamificationService from '@/services/gamificationService';

// GET /api/gamification/user-data
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const gamificationData = await GamificationService.getUserGamificationData(session.user.id);
    return NextResponse.json(gamificationData);
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch gamification data' },
