import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 특정 대화방 조회
export async function GET(req: NextRequest, { params }: { params: { chatroomId: string } }) {
  const { chatroomId } = params;
  const chatroom = await prisma.chatroom.findUnique({ where: { id: chatroomId } });
  if (!chatroom) {
    return NextResponse.json({ error: '대화방을 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json(chatroom);
}

// PATCH: 대화방 정보 수정
export async function PATCH(req: NextRequest, { params }: { params: { chatroomId: string } }) {
  const { chatroomId } = params;
  const { name } = await req.json();
  const chatroom = await prisma.chatroom.update({
    where: { id: chatroomId },
    data: { name },
  });
  return NextResponse.json(chatroom);
}

// DELETE: 대화방 삭제
export async function DELETE(req: NextRequest, { params }: { params: { chatroomId: string } }) {
  const { chatroomId } = params;
  await prisma.chatroom.delete({ where: { id: chatroomId } });
  return NextResponse.json({ success: true });
}