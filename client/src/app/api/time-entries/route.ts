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
    const active = url.searchParams.get('active') === 'true';
    const completed = url.searchParams.get('completed') === 'true';
    const projectId = url.searchParams.get('projectId');
    const limit = url.searchParams.get('limit');

    const whereClause: any = {
      userId: userId
    };

    if (active) {
      whereClause.endTime = null;
    } else if (completed) {
      whereClause.endTime = { not: null };
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const queryOptions: any = {
      where: whereClause,
      include: {
        project: true
      },
      orderBy: {
        startTime: 'desc'
      }
    };

    if (limit) {
      queryOptions.take = parseInt(limit, 10);
    }

    const timeEntries = await prisma.timeEntry.findMany(queryOptions);

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, description } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' }, 
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
        isActive: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or inactive' }, 
        { status: 404 }
      );
    }

    // Check if there's already an active time entry for this user
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: userId,
        endTime: null
      }
    });

    if (activeEntry) {
      return NextResponse.json(
        { error: 'There is already an active time entry. End it before starting a new one.' }, 
        { status: 400 }
      );
    }

    // Create new time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: userId,
        projectId: projectId,
        description: description?.trim() || null,
        startTime: new Date()
      },
      include: {
        project: true
      }
    });

    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' }, 
      { status: 500 }
    );
  }
}
