import { NextRequest, NextResponse } from 'next/server';
import { initializeDefaultPrompts } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    await initializeDefaultPrompts();
    return NextResponse.json({ message: '프롬프트가 초기화되었습니다.' });
  } catch (error) {
    console.error('Error initializing prompts:', error);
    return NextResponse.json({
      error: '프롬프트 초기화 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}