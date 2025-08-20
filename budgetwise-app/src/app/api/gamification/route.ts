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
      { status: 500 }
    );
  }
}

// POST /api/gamification/achievements/unlock
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { achievementData } = await req.json();
    const achievement = await GamificationService.unlockAchievement(session.user.id, achievementData);
    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json(
      { message: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}