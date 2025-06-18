import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 프로젝트 메모리 API 요청 처리
  if (request.nextUrl.pathname.startsWith('/api/memories/project/')) {
    const projectId = request.nextUrl.pathname.split('/').pop();
    const response = NextResponse.next();
    response.headers.set('x-project-id', projectId || '');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/memories/project/:projectId*',
}