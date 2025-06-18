import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 프롬프트 목록 조회
export async function GET(req: NextRequest) {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: '프롬프트 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 프롬프트 생성/업데이트
export async function POST(req: NextRequest) {
  try {
    const { type, content, description } = await req.json();

    // 기존 활성 프롬프트가 있으면 비활성화
    await prisma.prompt.updateMany({
      where: { type, isActive: true },
      data: { isActive: false }
    });

    // 새 버전의 프롬프트 생성
    const latestPrompt = await prisma.prompt.findFirst({
      where: { type },
      orderBy: { version: 'desc' }
    });

    const newPrompt = await prisma.prompt.create({
      data: {
        type,
        content,
        description,
        version: (latestPrompt?.version || 0) + 1
      }
    });

    return NextResponse.json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: '프롬프트 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}