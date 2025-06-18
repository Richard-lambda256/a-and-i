import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const prismaClient = new PrismaClient();

// GET: 특정 대화 조회
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const conversation = await prismaClient.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: '대화를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json(conversation);
}

// PATCH: 대화 정보/상태/응답/코칭결과 수정
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const conversation = await prismaClient.conversation.update({
      where: { id },
      data,
    });
    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// DELETE: 대화 삭제
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  await prismaClient.conversation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}