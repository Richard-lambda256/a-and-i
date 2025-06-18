import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest, { params }: any) {
  const { chatroomId } = params;
  const auth = _request.headers.get('authorization');
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
  return NextResponse.json(chatroom);
}

export async function PATCH(request: NextRequest, { params }: any) {
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
  const data = await request.json();
  const updatedChatroom = await prisma.chatroom.update({
    where: { id: chatroomId },
    data,
  });
  return NextResponse.json(updatedChatroom);
}

export async function DELETE(_request: NextRequest, { params }: any) {
  const { chatroomId } = params;
  const auth = _request.headers.get('authorization');
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
  await prisma.chatroom.delete({ where: { id: chatroomId } });
  return NextResponse.json({ message: '대화방이 삭제되었습니다.' });
}