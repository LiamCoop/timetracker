import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeEntryId = params.id;
    const body = await request.json();
    const { endTime, description } = body;

    // Verify time entry belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id: timeEntryId,
        userId: userId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' }, 
        { status: 404 }
      );
    }

    // Calculate duration if endTime is provided
    let duration = null;
    const endTimeDate = endTime ? new Date(endTime) : new Date();
    
    if (endTimeDate) {
      const startTime = new Date(existingEntry.startTime);
      duration = Math.round((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60)); // Duration in minutes
    }

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: {
        id: timeEntryId
      },
      data: {
        endTime: endTime ? new Date(endTime) : new Date(),
        description: description !== undefined ? description?.trim() || null : existingEntry.description,
        duration: duration
      },
      include: {
        project: true
      }
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to update time entry' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeEntryId = params.id;

    // Verify time entry belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id: timeEntryId,
        userId: userId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' }, 
        { status: 404 }
      );
    }

    // Delete time entry
    await prisma.timeEntry.delete({
      where: {
        id: timeEntryId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete time entry' }, 
      { status: 500 }
    );
  }
}