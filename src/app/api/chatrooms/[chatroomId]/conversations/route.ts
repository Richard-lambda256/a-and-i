import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest, { params }: any) {
  const { chatroomId } = params;

  const auth = _request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json([], { status: 200 });
  }

  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json([], { status: 200 });
  }

  const chatroom = await prisma.chatroom.findUnique({ where: { id: chatroomId } });
  if (!chatroom) {
    return NextResponse.json([], { status: 200 });
  }

  const project = await prisma.project.findUnique({ where: { id: chatroom.projectId } });
  if (!project || project.apiKeyId !== apiKey.id) {
    return NextResponse.json([], { status: 200 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { chatroomId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: NextRequest, { params }: any) {
  const { chatroomId } = params;

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }

  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }

  const chatroom = await prisma.chatroom.findUnique({ where: { id: chatroomId } });
  if (!chatroom) {
    return NextResponse.json({ error: '대화방을 찾을 수 없습니다.' }, { status: 404 });
  }

  const project = await prisma.project.findUnique({ where: { id: chatroom.projectId } });
  if (!project || project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { userQuestion = '' } = await request.json();

  const conversation = await prisma.conversation.create({
    data: {
      chatroomId,
      userQuestion: userQuestion.trim(),
      usedQuestion: userQuestion.trim(),
      aiResponse: '',
      state: 'new',
      preCoachingResult: null,
      postCoachingResult: null,
    },
  });

  return NextResponse.json(conversation);
}