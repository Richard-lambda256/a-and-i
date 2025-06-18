import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { getActivePrompt, applyContext, formatMemories, formatChatHistory } from '@/lib/prompts';
import { PRE_COACHING_PROMPT } from '@/prompts/pre-coaching-prompt';

interface PreCoachingResponse {
  keywords: string[];
  summary: string;
  context_suggestions: {
    required: string[];
    optional: string[];
  };
  optimized_question: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 apiKey 추출
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
    }
    const apiKey = auth.replace('Bearer ', '').trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 필요합니다.' }, { status: 401 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const { question, projectId } = await request.json();

    // 1. 컨텍스트 수집
    const [globalMemories, projectMemories, project] = await Promise.all([
      prisma.globalMemory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.projectMemory.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.project.findUnique({
        where: { id: projectId }
      })
    ]);

    // 2. 프롬프트 생성 (함수 사용)
    const context = {
      globalMemories: globalMemories.map(m => m.content),
      projectMemories: projectMemories.map(m => m.content),
      projectGuidelines: project?.guideline || '',
      previousConversations: [] // pre에서는 대화 이력 없음
    };
    const promptTemplate = PRE_COACHING_PROMPT({ question, context });

    // 3. AI 응답 생성
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const text = response.text();

    // 4. 프롬프트 기록 저장
    await prisma.prompt.create({
      data: {
        type: 'PRE_COACHING',
        content: promptTemplate,
        description: 'Pre-coaching에서 실제 사용된 프롬프트',
        version: 1
      }
    });

    // 5. 응답 파싱
    let parsedResponse: PreCoachingResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // JSON 부분만 추출 시도
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedResponse = JSON.parse(match[0]);
        } catch {
          // fallback
          parsedResponse = {
            keywords: extractKeywords(text),
            summary: generateSummary(text),
            context_suggestions: {
              required: [],
              optional: []
            },
            optimized_question: text
          };
        }
      } else {
        // fallback
        parsedResponse = {
          keywords: extractKeywords(text),
          summary: generateSummary(text),
          context_suggestions: {
            required: [],
            optional: []
          },
          optimized_question: text
        };
      }
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error in pre-coaching:', error);
    return NextResponse.json(
      { error: 'Pre-coaching 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 키워드 추출 함수
function extractKeywords(text: string): string[] {
  const words = text.split(/\s+/);
  const keywords = new Set<string>();

  for (const word of words) {
    if (word.length > 4 && !word.match(/^[0-9]+$/)) {
      keywords.add(word);
    }
  }

  return Array.from(keywords).slice(0, 5);
}

// 요약 생성 함수
function generateSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  return sentences.length > 0 ? sentences[0].trim() : text.slice(0, 100);
}