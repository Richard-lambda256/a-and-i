import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.headers.get('x-project-id');
    if (!projectId) {
      return new Response('Project ID is required', { status: 400 });
    }

    const memories = await prisma.projectMemory.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json(memories);
  } catch (error) {
    console.error('Error fetching project memories:', error);
    return new Response('Error fetching project memories', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const projectId = request.headers.get('x-project-id');
    if (!projectId) {
      return new Response('Project ID is required', { status: 400 });
    }

    const { content } = await request.json();
    if (!content) {
      return new Response('Content is required', { status: 400 });
    }

    const memory = await prisma.projectMemory.create({
      data: {
        content,
        projectId
      }
    });

    return Response.json(memory);
  } catch (error) {
    console.error('Error creating project memory:', error);
    return new Response('Error creating project memory', { status: 500 });
  }
}