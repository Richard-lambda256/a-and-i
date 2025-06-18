import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: any) {
  try {
    const { projectId } = params;
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const memories = await prisma.projectMemory.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error fetching project memories:', error);
    return NextResponse.json({ error: 'Error fetching project memories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: any) {
  try {
    const { projectId } = params;
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const memory = await prisma.projectMemory.create({
      data: {
        content,
        projectId
      }
    });

    return NextResponse.json(memory);
  } catch (error) {
    console.error('Error creating project memory:', error);
    return NextResponse.json({ error: 'Error creating project memory' }, { status: 500 });
  }
}