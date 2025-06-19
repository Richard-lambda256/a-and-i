import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { ASK_PROMPT } from '@/prompts/ask-prompt';

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

    const { question, projectId, chatroomId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: 'projectId가 필요합니다.' }, { status: 400 });
    }

    // 1. 컨텍스트 수집
    const [globalMemories, projectMemories, project, conversations] = await Promise.all([
      prisma.globalMemory.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.projectMemory.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.project.findUnique({ where: { id: projectId } }),
      chatroomId
        ? prisma.conversation.findMany({
            where: { chatroomId },
            orderBy: { createdAt: 'asc' },
            take: 10,
          })
        : Promise.resolve([]),
    ]);

    // 2. 프롬프트 생성 (함수 사용)
    const context = {
      globalMemories: globalMemories.map(m => m.content),
      projectMemories: projectMemories.map(m => m.content),
      projectGuidelines: project?.guideline || '',
      previousConversations: conversations.map(c => {
        if (c.postCoachingResult) {
          try {
            const postCoaching = typeof c.postCoachingResult === 'string'
              ? JSON.parse(c.postCoachingResult)
              : c.postCoachingResult;
            if (postCoaching.summary) {
              return postCoaching.summary;
            }
          } catch (e) {
            console.error('Error parsing postCoachingResult:', e);
          }
        }
        return '';
      }).filter(Boolean),
    };

    console.log('Project guidelines:', project?.guideline);
    console.log('Context being sent to AI:', {
      globalMemories: context.globalMemories,
      projectMemories: context.projectMemories,
      projectGuidelines: context.projectGuidelines,
      previousConversations: context.previousConversations
    });

    const promptTemplate = ASK_PROMPT({ question, context });

    // 3. AI 응답 생성
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const text = response.text();

    // 4. 프롬프트 기록 저장
    await prisma.prompt.create({
      data: {
        type: 'MAIN_CHAT',
        content: promptTemplate,
        description: 'Main chat에서 실제 사용된 프롬프트',
        version: 1
      }
    });

    // 5. AI 응답을 JSON으로 파싱해 그대로 반환 (pre-coaching과 동일)
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch {
      // JSON 부분만 추출 시도
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedResponse = JSON.parse(match[0]);
        } catch {
          parsedResponse = { answer: text, keywords: [], summary: '', follow_up_questions: [] };
        }
      } else {
        parsedResponse = { answer: text, keywords: [], summary: '', follow_up_questions: [] };
      }
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error in AI ask:', error);
    return NextResponse.json({ error: 'AI 질문 중 오류가 발생했습니다.' }, { status: 500 });
  }
}