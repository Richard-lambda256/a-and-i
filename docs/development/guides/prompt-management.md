# 프롬프트 관리 가이드

## 1. 프롬프트 시스템 개요

### 1.1 목적
- 일관된 프롬프트 형식 유지
- 프롬프트 버전 관리
- 프롬프트 성능 분석
- **계층적 context(전역 기억→프로젝트 기억→대화 이력) 기반 프롬프트 최적화**

### 1.2 프롬프트 타입
- 코칭 프롬프트
- 기억 분석 프롬프트
- 패턴 인식 프롬프트
- 컨텍스트 분석 프롬프트

## 2. 프롬프트 구조 및 context 통합

### 2.1 계층적 context 스택 구조
- 모든 프롬프트는 아래와 같이 context를 계층적으로 스택 형태로 쌓아 프롬프트에 포함
- context: 전역 기억 → 프로젝트 기억 → 대화 이력 순서
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

### 2.2 API 호출 흐름 예시
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

## 3. 프롬프트 구조

### 3.1 기본 프롬프트 인터페이스
```typescript
interface IPrompt {
  id: string;
  type: PromptType;
  version: string;
  template: string;
  parameters: {
    required: string[];
    optional: string[];
  };
  metadata: {
    author: string;
    createdAt: number;
    updatedAt: number;
    performance: IPromptPerformance;
    parentContext?: {
      depth: number;
      roomId: string;
    };
  };
}

enum PromptType {
  COACHING = 'COACHING',
  MEMORY_ANALYSIS = 'MEMORY_ANALYSIS',
  PATTERN_RECOGNITION = 'PATTERN_RECOGNITION',
  CONTEXT_ANALYSIS = 'CONTEXT_ANALYSIS'
}
```

### 3.2 프롬프트 성능 메트릭스
```typescript
interface IPromptPerformance {
  averageResponseTime: number;
  successRate: number;
  userSatisfactionScore: number;
  tokenUsage: {
    input: number;
    output: number;
  };
  parentContextMetrics?: {
    depth: number;
    impact: number;
    relevance: number;
  }[];
  lastEvaluated: number;
}
```

## 4. 프롬프트 템플릿

### 4.1 코칭 프롬프트 템플릿
```typescript
interface ICoachingPrompt extends IPrompt {
  preCoaching: string;
  postCoaching: string;
  contextIntegration: string;
  followUpQuestions: string[];
  parentContextIntegration?: {
    depth: number;
    template: string;
  }[];
}

class CoachingPromptBuilder {
  private prompt: ICoachingPrompt;

  constructor() {
    // 구현
  }

  withPreCoaching(template: string): this {
    // 구현
    return this;
  }

  withPostCoaching(template: string): this {
    // 구현
    return this;
  }

  withParentContext(depth: number, template: string): this {
    // 구현
    return this;
  }

  build(): ICoachingPrompt {
    // 구현
    return this.prompt;
  }
}
```

### 4.2 기억 분석 프롬프트
```typescript
interface IMemoryAnalysisPrompt extends IPrompt {
  keywordExtraction: string;
  relevanceAnalysis: string;
  impactAssessment: string;
  parentContextAnalysis?: {
    depth: number;
    template: string;
  }[];
}

class MemoryAnalysisPromptBuilder {
  // 구현
}
```

## 5. 프롬프트 관리

### 5.1 프롬프트 저장소
```typescript
interface IPromptRepository {
  save: (prompt: IPrompt) => Promise<void>;
  get: (id: string) => Promise<IPrompt>;
  update: (id: string, updates: Partial<IPrompt>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  list: (type?: PromptType) => Promise<IPrompt[]>;
  getParentContextPrompts: (
    roomId: string,
    depth: number
  ) => Promise<IPrompt[]>;
}

class PromptRepository implements IPromptRepository {
  // 구현
}
```

### 5.2 버전 관리
```typescript
interface IPromptVersion {
  version: string;
  prompt: IPrompt;
  changes: string[];
  performance: IPromptPerformance;
  parentContextChanges?: {
    depth: number;
    changes: string[];
  }[];
}

class PromptVersionManager {
  createVersion(prompt: IPrompt): Promise<string> {
    // 구현
  }

  compareVersions(v1: string, v2: string): Promise<{
    differences: string[];
    performanceChange: number;
    parentContextChanges?: {
      depth: number;
      changes: string[];
    }[];
  }> {
    // 구현
  }
}
```

## 6. 프롬프트 최적화

### 6.1 성능 분석
```typescript
interface IPromptAnalyzer {
  analyzePerformance: (prompt: IPrompt) => Promise<IPromptPerformance>;
  suggestImprovements: (prompt: IPrompt) => Promise<string[]>;
  detectBottlenecks: (prompt: IPrompt) => Promise<{
    issue: string;
    impact: number;
    suggestion: string;
  }[]>;
  analyzeParentContext: (
    prompt: IPrompt,
    depth: number
  ) => Promise<{
    impact: number;
    relevance: number;
    suggestions: string[];
  }>;
}

class PromptAnalyzer implements IPromptAnalyzer {
  // 구현
}
```

### 6.2 자동 최적화
```typescript
interface IPromptOptimizer {
  optimize: (prompt: IPrompt) => Promise<IPrompt>;
  validateOptimization: (
    original: IPrompt,
    optimized: IPrompt
  ) => Promise<boolean>;
  optimizeParentContext: (
    prompt: IPrompt,
    depth: number
  ) => Promise<IPrompt>;
}

class PromptOptimizer implements IPromptOptimizer {
  // 구현
}
```

## 7. 테스트 및 평가

### 7.1 프롬프트 테스트
```typescript
interface IPromptTester {
  test: (prompt: IPrompt) => Promise<{
    success: boolean;
    performance: IPromptPerformance;
    issues: string[];
  }>;
  testParentContext: (
    prompt: IPrompt,
    depth: number
  ) => Promise<{
    success: boolean;
    performance: IPromptPerformance;
    issues: string[];
  }>;
}

class PromptTester implements IPromptTester {
  // 구현
}
```

### 7.2 A/B 테스트
```typescript
interface IPromptABTest {
  runTest: (
    promptA: IPrompt,
    promptB: IPrompt,
    sampleSize: number
  ) => Promise<{
    winner: string;
    metrics: {
      responseTime: number;
      successRate: number;
      userSatisfaction: number;
    };
  }>;
  runParentContextTest: (
    promptA: IPrompt,
    promptB: IPrompt,
    depth: number,
    sampleSize: number
  ) => Promise<{
    winner: string;
    metrics: {
      responseTime: number;
      successRate: number;
      userSatisfaction: number;
    };
  }>;
}

class PromptABTester implements IPromptABTest {
  // 구현
}
```

## 8. 모니터링 및 로깅

### 8.1 프롬프트 모니터링
```typescript
interface IPromptMonitor {
  monitor: (prompt: IPrompt) => void;
  getMetrics: () => IPromptPerformance;
  alertOnIssues: (threshold: number) => void;
  monitorParentContext: (
    prompt: IPrompt,
    depth: number
  ) => void;
}

class PromptMonitor implements IPromptMonitor {
  // 구현
}
```

### 8.2 로깅
```typescript
interface IPromptLogger {
  logUsage: (prompt: IPrompt, context: any, result: any) => void;
  logError: (prompt: IPrompt, error: Error) => void;
  getStats: (promptId: string) => Promise<{
    usageCount: number;
    errorRate: number;
    averageLatency: number;
  }>;
  logParentContextUsage: (
    prompt: IPrompt,
    depth: number,
    context: any,
    result: any
  ) => void;
}

class PromptLogger implements IPromptLogger {
  // 구현
}
```