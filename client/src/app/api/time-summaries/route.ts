import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    });

    // Get time entries for each period
    const [todayEntries, weekEntries, monthEntries] = await Promise.all([
      prisma.timeEntry.findMany({
        where: {
          userId: userId,
          startTime: {
            gte: today
          },
          endTime: {
            not: null
          }
        },
        select: {
          projectId: true,
          duration: true
        }
      }),
      prisma.timeEntry.findMany({
        where: {
          userId: userId,
          startTime: {
            gte: startOfWeek
          },
          endTime: {
            not: null
          }
        },
        select: {
          projectId: true,
          duration: true
        }
      }),
      prisma.timeEntry.findMany({
        where: {
          userId: userId,
          startTime: {
            gte: startOfMonth
          },
          endTime: {
            not: null
          }
        },
        select: {
          projectId: true,
          duration: true
        }
      })
    ]);

    // Calculate totals for each project and period
    const summaries = projects.map(project => {
      const todayTotal = todayEntries
        .filter(entry => entry.projectId === project.id)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);
      
      const weekTotal = weekEntries
        .filter(entry => entry.projectId === project.id)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);
      
      const monthTotal = monthEntries
        .filter(entry => entry.projectId === project.id)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);

      return {
        project,
        today: todayTotal,
        thisWeek: weekTotal,
        thisMonth: monthTotal
      };
    });

    // Filter out projects with no time tracked
    const activeSummaries = summaries.filter(summary => 
      summary.today > 0 || summary.thisWeek > 0 || summary.thisMonth > 0
    );

    return NextResponse.json(activeSummaries);
  } catch (error) {
    console.error('Error fetching time summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time summaries' }, 
      { status: 500 }
    );
  }
}
