import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 등록된 API Key 조회 (Authorization 헤더의 key만)
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json(null);
  }
  const key = auth.replace('Bearer ', '').trim();
  if (!key) {
    return NextResponse.json(null);
  }
  const apiKey = await prisma.apiKey.findFirst({
    where: { key },
    select: { id: true, key: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(apiKey);
}

// POST: API Key 등록/수정 (Upsert)
export async function POST(req: NextRequest) {
  const { key } = await req.json();
  if (!key) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 400 });
  }
  // 기존 키가 있으면 업데이트, 없으면 생성
  const latest = await prisma.apiKey.findFirst({ orderBy: { createdAt: 'desc' } });
  let result;
  if (latest) {
    result = await prisma.apiKey.update({
      where: { id: latest.id },
      data: { key },
    });
  } else {
    result = await prisma.apiKey.create({ data: { key } });
  }
  return NextResponse.json({ id: result.id, createdAt: result.createdAt, updatedAt: result.updatedAt });
}