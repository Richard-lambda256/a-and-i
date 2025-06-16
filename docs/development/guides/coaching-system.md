# 코칭 시스템 개발 가이드

## 1. 시스템 개요

### 1.1 목적
- 사용자의 질문 품질 향상
- Context 기반 질문 추천
- 응답 분석 및 기억 저장

### 1.2 주요 기능
- 질문 전 코칭
- 질문 후 코칭
- Context 관리
- 기억 저장소 연동

## 2. 질문 전 코칭

### 2.1 컴포넌트 구조
```typescript
interface IPreCoachingProps {
  userQuestion: string;
  contexts: {
    globalMemory: IMemory[];
    projectMemory: IMemory[];
    parentContexts: {
      roomMemory: IMemory[];
      chatHistory: IChat[];
      parentContexts?: {
        roomMemory: IMemory[];
        chatHistory: IChat[];
        parentContexts?: {
          // 재귀적 구조
        };
      };
    };
    currentChatHistory: IChat[];
  };
  onQuestionUpdate: (question: string) => void;
}

const PreCoaching: React.FC<IPreCoachingProps> = ({
  userQuestion,
  contexts,
  onQuestionUpdate
}) => {
  // 구현
};
```

### 2.2 Context 기반 질문 추천
```typescript
interface IQuestionRecommendation {
  question: string;
  reason: string;
  usedContexts: {
    type: string;
    id: string;
    relevance: number;
    depth?: number; // 부모 컨텍스트의 깊이
  }[];
  expectedBenefits: string[];
}

const useQuestionRecommendation = (
  question: string,
  contexts: IContexts
): IQuestionRecommendation[] => {
  // 구현
};
```

### 2.3 프롬프트 처리
```typescript
interface IPromptProcessor {
  processPreCoaching: (input: {
    question: string;
    contexts: IContexts;
  }) => Promise<ICoachingResult>;
}

class PreCoachingPromptProcessor implements IPromptProcessor {
  // 구현
}
```

## 3. 질문 후 코칭

### 3.1 기억 저장 분석
```typescript
interface IMemoryAnalysis {
  isStorable: boolean;
  keywords: string[];
  reason: string;
  impact: number;
  summary: string;
  parentContextImpact?: {
    depth: number;
    impact: number;
    reason: string;
  }[];
}

const analyzeMemoryStorage = async (
  response: string,
  context: IContexts
): Promise<IMemoryAnalysis> => {
  // 구현
};
```

### 3.2 요청 형식 분석
```typescript
interface IPatternAnalysis {
  patternDetected: boolean;
  patternType: string;
  patternExample: string;
  applicability: {
    global: boolean;
    project: boolean;
    room: boolean;
    parentRooms: {
      depth: number;
      applicable: boolean;
      reason: string;
    }[];
  };
  reason: string;
}

const analyzeRequestPattern = async (
  response: string
): Promise<IPatternAnalysis> => {
  // 구현
};
```

### 3.3 기억 영향도 분석
```typescript
interface IMemoryImpact {
  impactPercentage: number;
  keyMemories: string[];
  impactDetails: string;
}

interface IMemoryImpactAnalysis {
  global: IMemoryImpact;
  project: IMemoryImpact;
  room: IMemoryImpact;
  parentRooms: {
    depth: number;
    impact: IMemoryImpact;
  }[];
  overallAnalysis: string;
}

const analyzeMemoryImpact = async (
  response: string,
  contexts: IContexts
): Promise<IMemoryImpactAnalysis> => {
  // 구현
};
```

## 4. 상태 관리

### 4.1 Zustand Store
```typescript
interface ICoachingState {
  preCoaching: {
    recommendations: IQuestionRecommendation[];
    selectedRecommendation: string | null;
  };
  postCoaching: {
    memoryAnalysis: IMemoryAnalysis | null;
    patternAnalysis: IPatternAnalysis | null;
    impactAnalysis: IMemoryImpactAnalysis | null;
  };
}

export const useCoachingStore = create<ICoachingState & {
  setRecommendations: (recommendations: IQuestionRecommendation[]) => void;
  selectRecommendation: (id: string) => void;
  setMemoryAnalysis: (analysis: IMemoryAnalysis) => void;
  setPatternAnalysis: (analysis: IPatternAnalysis) => void;
  setImpactAnalysis: (analysis: IMemoryImpactAnalysis) => void;
  resetCoaching: () => void;
}>((set) => ({
  preCoaching: {
    recommendations: [],
    selectedRecommendation: null,
  },
  postCoaching: {
    memoryAnalysis: null,
    patternAnalysis: null,
    impactAnalysis: null,
  },
  setRecommendations: (recommendations) =>
    set((state) => ({
      preCoaching: {
        ...state.preCoaching,
        recommendations,
      },
    })),
  selectRecommendation: (id) =>
    set((state) => ({
      preCoaching: {
        ...state.preCoaching,
        selectedRecommendation: id,
      },
    })),
  setMemoryAnalysis: (analysis) =>
    set((state) => ({
      postCoaching: {
        ...state.postCoaching,
        memoryAnalysis: analysis,
      },
    })),
  setPatternAnalysis: (analysis) =>
    set((state) => ({
      postCoaching: {
        ...state.postCoaching,
        patternAnalysis: analysis,
      },
    })),
  setImpactAnalysis: (analysis) =>
    set((state) => ({
      postCoaching: {
        ...state.postCoaching,
        impactAnalysis: analysis,
      },
    })),
  resetCoaching: () =>
    set({
      preCoaching: {
        recommendations: [],
        selectedRecommendation: null,
      },
      postCoaching: {
        memoryAnalysis: null,
        patternAnalysis: null,
        impactAnalysis: null,
      },
    }),
}));
```

### 4.2 컴포넌트 구조
```typescript
// app/(chat)/[project-id]/[room-id]/page.tsx
export default function ChatRoomPage({
  params: { projectId, roomId },
}: {
  params: { projectId: string; roomId: string };
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <ChatHeader projectId={projectId} roomId={roomId} />
        <ChatMessages />
        <ChatInput />
      </div>
      <CoachingPanel />
    </div>
  );
}

// components/coaching/pre-coaching.tsx
export function PreCoaching() {
  const { recommendations, selectedRecommendation } = useCoachingStore(
    (state) => state.preCoaching
  );

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>질문 추천</CardTitle>
          <CardDescription>
            컨텍스트를 기반으로 최적화된 질문을 추천해드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isSelected={selectedRecommendation === rec.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// components/coaching/post-coaching.tsx
export function PostCoaching() {
  const { memoryAnalysis, patternAnalysis, impactAnalysis } = useCoachingStore(
    (state) => state.postCoaching
  );

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="memory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memory">기억 분석</TabsTrigger>
          <TabsTrigger value="pattern">패턴 분석</TabsTrigger>
          <TabsTrigger value="impact">영향도 분석</TabsTrigger>
        </TabsList>
        <TabsContent value="memory">
          <MemoryAnalysisCard analysis={memoryAnalysis} />
        </TabsContent>
        <TabsContent value="pattern">
          <PatternAnalysisCard analysis={patternAnalysis} />
        </TabsContent>
        <TabsContent value="impact">
          <ImpactAnalysisCard analysis={impactAnalysis} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4.3 API 인터페이스
```typescript
// app/api/coaching/pre/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const PreCoachingSchema = z.object({
  question: z.string(),
  contexts: z.object({
    globalMemory: z.array(z.any()),
    projectMemory: z.array(z.any()),
    parentContexts: z.object({
      roomMemory: z.array(z.any()),
      chatHistory: z.array(z.any()),
      parentContexts: z.optional(z.any()),
    }),
    currentChatHistory: z.array(z.any()),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, contexts } = PreCoachingSchema.parse(body);

    const result = await getPreCoaching({ question, contexts });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 4.4 에러 처리
```typescript
// lib/exceptions.ts
export class CoachingError extends Error {
  constructor(
    message: string,
    public type: CoachingErrorType,
    public details?: any
  ) {
    super(message);
    this.name = 'CoachingError';
  }
}

// components/ui/error-card.tsx
export function ErrorCard({
  error,
  onRetry,
}: {
  error: CoachingError;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">오류 발생</CardTitle>
        <CardDescription>{error.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-sm text-muted-foreground">
          {JSON.stringify(error.details, null, 2)}
        </pre>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button variant="outline" onClick={onRetry}>
            다시 시도
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### 4.5 테스트
```typescript
// __tests__/components/coaching/pre-coaching.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PreCoaching } from '@/components/coaching/pre-coaching';

describe('PreCoaching', () => {
  it('should render recommendations', () => {
    render(<PreCoaching />);
    expect(screen.getByText('질문 추천')).toBeInTheDocument();
  });

  it('should select recommendation on click', () => {
    render(<PreCoaching />);
    const recommendationCard = screen.getByTestId('recommendation-0');
    fireEvent.click(recommendationCard);
    expect(recommendationCard).toHaveClass('border-primary');
  });
});
```

## 0. 프롬프트 및 API 호출 정책(공통)

- 모든 AI 관련 프롬프트 및 API 호출 시, context(전역 기억, 프로젝트 기억, 대화 이력 등)를 계층적으로 스택 형태로 모아 프롬프트에 포함
- 실제 프롬프트 예시:
```
[전역 기억]
- React란 무엇인가?
- 상태 관리란 무엇인가?

[프로젝트 기억]
- 이 프로젝트는 Next.js 기반이다.
- Zustand를 상태 관리로 사용한다.

[대화 이력]
- Q: useEffect와 useMemo의 차이점은?
- A: ...

[사용자 질문]
- React에서 상태 관리를 어떻게 하면 좋을까?
```
- 위와 같이 context를 쌓아서 LLM(Gemini 등)에 전달
- 모든 코칭/AI질문/후코칭 API는 context를 body에 포함해 호출

### API 호출 흐름 예시
```ts
// 대화전 코칭
POST /api/coaching/pre
body: { question, context: { globalMemories, projectMemories, chatHistory } }

// 실제 AI 질문
POST /api/ai/ask
body: { question, context: { globalMemories, projectMemories, chatHistory } }

// 대화후 코칭
POST /api/coaching/post
body: { question, answer, context: { globalMemories, projectMemories, chatHistory } }
```

- context 관리 및 프롬프트 구성은 Claude, Gemini, GPT 등 모든 LLM에서 베스트 프랙티스임을 명시