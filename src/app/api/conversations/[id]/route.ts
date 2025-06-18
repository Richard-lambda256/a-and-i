import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function GET(_request: NextRequest, { params }: any) {
  const { id } = params;
  const conversation = await prismaClient.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: '대화를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json(conversation);
}

export async function PATCH(request: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const data = await request.json();

    const conversation = await prismaClient.conversation.update({
      where: { id },
      data,
    });
    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: any) {
  const { id } = params;
  await prismaClient.conversation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}