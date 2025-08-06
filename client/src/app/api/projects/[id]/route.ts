import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    
    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' }, 
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' }, 
      { status: 500 }
    );
  }
}
