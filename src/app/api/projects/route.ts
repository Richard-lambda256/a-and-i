import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';

// GET: 내 API Key로 생성한 프로젝트 목록만 조회
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json([], { status: 200 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prismaClient.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json([], { status: 200 });
  }
  const projects = await prismaClient.project.findMany({
    where: { apiKeyId: apiKey.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

// POST: 내 API Key로 프로젝트 생성
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prismaClient.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  const { name, guideline } = await req.json();
  if (!name) {
    return NextResponse.json({ error: '프로젝트 이름이 필요합니다.' }, { status: 400 });
  }
  const project = await prismaClient.project.create({
    data: { name, guideline, apiKeyId: apiKey.id },
  });
  return NextResponse.json(project);
}