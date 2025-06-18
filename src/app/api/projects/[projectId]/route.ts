import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 특정 프로젝트 조회
export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json(project);
}

// PATCH: 프로젝트 정보 수정
export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { name, guideline } = await req.json();
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name, guideline },
  });
  return NextResponse.json(project);
}

// DELETE: 프로젝트 삭제
export async function DELETE(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ success: true });
}