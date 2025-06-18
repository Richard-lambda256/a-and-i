import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const memories = await prisma.globalMemory.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error fetching global memories:', error);
    return NextResponse.json({ error: 'Failed to fetch global memories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const memory = await prisma.globalMemory.create({
      data: {
        content
      }
    });

    return NextResponse.json(memory);
  } catch (error) {
    console.error('Error creating global memory:', error);
    return NextResponse.json({ error: 'Failed to create global memory' }, { status: 500 });
  }
}