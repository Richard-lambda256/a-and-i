import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 특정 프로젝트의 대화방 목록 조회 (소유자 검증)
export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json([], { status: 200 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json([], { status: 200 });
  }
  // 소유자 검증
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.apiKeyId !== apiKey.id) {
    return NextResponse.json([], { status: 200 });
  }
  const chatrooms = await prisma.chatroom.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(chatrooms);
}

// POST: 대화방 생성 (소유자 검증)
export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  // 소유자 검증
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: '대화방 이름이 필요합니다.' }, { status: 400 });
  }
  const chatroom = await prisma.chatroom.create({
    data: { name, projectId },
  });
  return NextResponse.json(chatroom);
}