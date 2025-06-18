import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest, { params }: any) {
  const { projectId } = params;
  const auth = _request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  const chatrooms = await prisma.chatroom.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(chatrooms);
}

export async function POST(request: NextRequest, { params }: any) {
  const { projectId } = params;
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  const { name = '새 대화방' } = await request.json();
  const chatroom = await prisma.chatroom.create({
    data: {
      projectId,
      name: name.trim(),
    },
  });
  return NextResponse.json(chatroom);
}