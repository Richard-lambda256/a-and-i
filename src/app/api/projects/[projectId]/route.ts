import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest, { params }: any) {
  const { projectId } = params;
  const auth = _request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  return NextResponse.json(project);
}

export async function PATCH(request: NextRequest, { params }: any) {
  const { projectId } = params;
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  const data = await request.json();
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data,
  });
  return NextResponse.json(updatedProject);
}

export async function DELETE(_request: NextRequest, { params }: any) {
  const { projectId } = params;
  const auth = _request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
  }
  const key = auth.replace('Bearer ', '').trim();
  const apiKey = await prisma.apiKey.findFirst({ where: { key } });
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key가 유효하지 않습니다.' }, { status: 401 });
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (project.apiKeyId !== apiKey.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ message: '프로젝트가 삭제되었습니다.' });
}