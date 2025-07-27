import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get current week (Sunday to Saturday) - matching the weekly-time API
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // Next Sunday

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: userId,
        projectId: projectId,
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek
        },
        endTime: { not: null } // Only completed entries
      },
      include: {
        project: true
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Use the database duration field (which matches the weekly-time API)
    const entriesWithDuration = timeEntries;

    return NextResponse.json(entriesWithDuration);
  } catch (error) {
    console.error('Error fetching weekly time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly time entries' }, 
      { status: 500 }
    );
  }
}