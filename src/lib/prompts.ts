import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type PromptType = 'PRE_COACHING' | 'MAIN_CHAT' | 'POST_COACHING';

interface ChatHistoryItem {
  question: string;
  answer: string;
}

interface Context {
  globalMemories?: string[];
  projectMemories?: string[];
  chatHistory?: ChatHistoryItem[];
  projectGuidelines?: string;
  question?: string;
}

export async function getActivePrompt(type: PromptType): Promise<string | null> {
  const prompt = await prisma.prompt.findFirst({
    where: { type, isActive: true },
    orderBy: { version: 'desc' }
  });
  return prompt?.content || null;
}

export async function createOrUpdatePrompt(type: PromptType, content: string, description?: string) {
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

  return await prisma.prompt.create({
    data: {
      type,
      content,
      description,
      version: (latestPrompt?.version || 0) + 1
    }
  });
}

// 프롬프트 초기화 함수
export async function initializeDefaultPrompts() {
  const preCoachingPrompt = `당신은 AI 학습 코치입니다. 사용자의 질문을 분석하고 더 나은 질문으로 개선하는 것이 목표입니다.

[전역 기억]
{globalMemories}

[프로젝트 지침]
{projectGuidelines}

[프로젝트 기억]
{projectMemories}

[대화 이력]
{chatHistory}

[사용자 질문]
{question}

위 맥락을 바탕으로 다음을 제공해주세요:
1. 핵심 키워드와 카테고리 태그 추출
2. 질문의 의도와 목표 요약
3. 질문 개선을 위한 추가 맥락 제안
4. 최적화된 질문 제안`;

  const mainChatPrompt = `당신은 AI 개발 멘토입니다. 사용자의 질문에 대해 명확하고 실용적인 답변을 제공하는 것이 목표입니다.

[전역 기억]
{globalMemories}

[프로젝트 지침]
{projectGuidelines}

[프로젝트 기억]
{projectMemories}

[대화 이력]
{chatHistory}

[사용자 질문]
{question}

위 맥락을 바탕으로 다음을 제공해주세요:
1. 질문에 대한 직접적인 답변
2. 관련 코드 예시 (해당되는 경우)
3. 실제 적용 시 주의사항
4. 추가 학습 자료나 문서 링크`;

  await createOrUpdatePrompt('PRE_COACHING', preCoachingPrompt, '사전 코칭 프롬프트');
  await createOrUpdatePrompt('MAIN_CHAT', mainChatPrompt, '메인 채팅 프롬프트');
}

// 프롬프트 템플릿에 컨텍스트 적용
export function applyContext(template: string, context: Context): string {
  return template
    .replace('{globalMemories}', formatMemories(context.globalMemories))
    .replace('{projectGuidelines}', context.projectGuidelines || '없음')
    .replace('{projectMemories}', formatMemories(context.projectMemories))
    .replace('{chatHistory}', formatChatHistory(context.chatHistory))
    .replace('{question}', context.question || '');
}

export function formatMemories(memories: string[] = []): string {
  if (!memories.length) return '없음';
  return memories.map(m => `- ${m}`).join('\n');
}

export function formatChatHistory(history: ChatHistoryItem[] = []): string {
  if (!history.length) return '없음';
  return history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
}