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

    // Get current week (Sunday to Saturday)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // Next Sunday

    // Get all time entries for this project in the current week
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: userId,
        projectId: projectId,
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek
        },
        endTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        duration: true
      }
    });

    // Create array for all 7 days of the week
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekData = weekDays.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      
      // Calculate total duration for this day
      const dayTotal = timeEntries
        .filter(entry => {
          const entryDate = new Date(entry.startTime);
          return entryDate.getDate() === dayDate.getDate() &&
                 entryDate.getMonth() === dayDate.getMonth() &&
                 entryDate.getFullYear() === dayDate.getFullYear();
        })
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);

      return {
        day,
        date: dayDate.toISOString().split('T')[0], // YYYY-MM-DD format
        minutes: dayTotal
      };
    });

    return NextResponse.json(weekData);
  } catch (error) {
    console.error('Error fetching weekly time data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly time data' }, 
      { status: 500 }
    );
  }
}