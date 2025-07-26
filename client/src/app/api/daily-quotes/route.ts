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

    // Get all active quotes (regardless of user)
    const quotes = await prisma.dailyQuotes.findMany({
      where: {
        isActive: true
      }
    });

    if (quotes.length === 0) {
      return NextResponse.json(
        { error: 'No quotes found' }, 
        { status: 404 }
      );
    }

    // Select a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    return NextResponse.json(randomQuote);
  } catch (error) {
    console.error('Error fetching daily quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily quote' }, 
      { status: 500 }
    );
  }
}
