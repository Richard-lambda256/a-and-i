# 기억 관리 시스템 가이드

## 1. 시스템 개요

### 1.1 목적
- 대화 컨텍스트의 효율적 관리
- 기억의 계층적 저장 및 검색
- 패턴 기반 기억 분석
- 기억 영향도 평가
- **프로젝트별 지침(가이드라인/인스트럭션) 관리**

### 1.2 기억 타입
- 전역 기억 (Global Memory)
- 프로젝트 기억 (Project Memory)
- 채팅방 기억 (Chat Room Memory)
- 부모 채팅방 기억 (Parent Room Memory) - 재귀적 구조

### 1.1 프로젝트 지침
- 각 프로젝트는 별도의 지침(가이드라인/인스트럭션)을 가질 수 있음
- 지침은 프로젝트별로 1개(또는 최신 1개)만 관리
- 지침은 메모리와 별개로 프로젝트의 운영 원칙, 목표, 대화 가이드 등을 명시
- 프로젝트 생성/수정 시 입력 가능, 프로젝트 상세에서 확인/수정 가능

## 2. 기억 구조

### 2.1 기본 기억 인터페이스
```typescript
interface IMemory {
  id: string;
  type: MemoryType;
  content: string;
  keywords: string[];
  timestamp: number;
  metadata: {
    source: string;
    impact: number;
    confidence: number;
    relatedMemories: string[];
    parentContext?: {
      depth: number;
      roomId: string;
    };
  };
  context: {
    projectId?: string;
    roomId?: string;
    parentRoomIds?: string[]; // 상위 대화방 ID 배열
  };
}

enum MemoryType {
  GLOBAL = 'GLOBAL',
  PROJECT = 'PROJECT',
  ROOM = 'ROOM',
  PARENT_ROOM = 'PARENT_ROOM'
}
```

### 2.2 기억 저장소 구조
```typescript
interface IMemoryStore {
  global: Map<string, IMemory>;
  project: Map<string, Map<string, IMemory>>;
  room: Map<string, Map<string, IMemory>>;
  parentRoom: Map<string, Map<number, Map<string, IMemory>>>; // roomId -> depth -> memories
}

class MemoryManager {
  private store: IMemoryStore;

  constructor() {
    this.store = {
      global: new Map(),
      project: new Map(),
      room: new Map(),
      parentRoom: new Map()
    };
  }

  // 구현
}
```

## 3. 기억 저장

### 3.1 저장 프로세스
```typescript
interface IMemoryStorage {
  store: (memory: IMemory) => Promise<void>;
  update: (id: string, updates: Partial<IMemory>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  get: (id: string) => Promise<IMemory | null>;
  getParentMemories: (roomId: string, depth: number) => Promise<IMemory[]>;
}

class MemoryStorageService implements IMemoryStorage {
  // 구현
}
```

### 3.2 기억 분석
```typescript
interface IMemoryAnalyzer {
  analyzeContent: (content: string) => Promise<{
    keywords: string[];
    impact: number;
    confidence: number;
  }>;

  findRelatedMemories: (memory: IMemory) => Promise<string[]>;
  analyzeParentContext: (memory: IMemory) => Promise<{
    depth: number;
    relevance: number;
    impact: number;
  }>;
}

class MemoryAnalyzer implements IMemoryAnalyzer {
  // 구현
}
```

## 4. 기억 검색

### 4.1 검색 인터페이스
```typescript
interface IMemorySearchParams {
  query: string;
  type?: MemoryType;
  projectId?: string;
  roomId?: string;
  parentDepth?: number;
  timeRange?: {
    start: number;
    end: number;
  };
  keywords?: string[];
  minConfidence?: number;
}

interface IMemorySearchResult {
  memories: IMemory[];
  relevanceScores: Map<string, number>;
  parentContextScores: Map<string, {
    depth: number;
    score: number;
  }>;
  metadata: {
    totalCount: number;
    searchTime: number;
  };
}
```

### 4.2 검색 구현
```typescript
class MemorySearchService {
  async search(params: IMemorySearchParams): Promise<IMemorySearchResult> {
    // 구현
  }

  private calculateRelevance(memory: IMemory, query: string): number {
    // 구현
  }

  private calculateParentContextRelevance(
    memory: IMemory,
    depth: number
  ): number {
    // 구현
  }
}
```

## 5. 기억 최적화

### 5.1 기억 압축
```typescript
interface IMemoryCompressor {
  compress: (memories: IMemory[]) => Promise<IMemory>;
  shouldCompress: (memories: IMemory[]) => boolean;
  compressParentContext: (
    memories: IMemory[],
    depth: number
  ) => Promise<IMemory>;
}

class MemoryCompressor implements IMemoryCompressor {
  // 구현
}
```

### 5.2 기억 정리
```typescript
interface IMemoryCleaner {
  clean: () => Promise<void>;
  archiveOldMemories: () => Promise<void>;
  mergeRelatedMemories: () => Promise<void>;
  cleanParentContext: (depth: number) => Promise<void>;
}

class MemoryCleaner implements IMemoryCleaner {
  // 구현
}
```

## 6. 이벤트 처리

### 6.1 기억 이벤트
```typescript
enum MemoryEventType {
  CREATED = 'MEMORY_CREATED',
  UPDATED = 'MEMORY_UPDATED',
  DELETED = 'MEMORY_DELETED',
  COMPRESSED = 'MEMORY_COMPRESSED',
  ARCHIVED = 'MEMORY_ARCHIVED',
  PARENT_CONTEXT_UPDATED = 'PARENT_CONTEXT_UPDATED'
}

interface IMemoryEvent {
  type: MemoryEventType;
  memory: IMemory;
  timestamp: number;
  metadata?: {
    depth?: number;
    parentRoomId?: string;
  };
}
```

### 6.2 이벤트 처리기
```typescript
interface IMemoryEventHandler {
  handle: (event: IMemoryEvent) => Promise<void>;
  handleParentContextUpdate: (
    roomId: string,
    depth: number
  ) => Promise<void>;
}

class MemoryEventProcessor implements IMemoryEventHandler {
  // 구현
}
```

## 7. 성능 모니터링

### 7.1 메트릭스
```typescript
interface IMemoryMetrics {
  totalMemories: number;
  memoryByType: Map<MemoryType, number>;
  parentContextMetrics: Map<number, {
    count: number;
    averageDepth: number;
  }>;
  averageSearchTime: number;
  compressionRatio: number;
  storageUsage: number;
}

class MemoryMetricsCollector {
  // 구현
}
```

### 7.2 성능 최적화
```typescript
interface IMemoryOptimizer {
  optimize: () => Promise<void>;
  analyzePerformance: () => Promise<IMemoryMetrics>;
  suggestOptimizations: () => Promise<string[]>;
  optimizeParentContext: (depth: number) => Promise<void>;
}

class MemoryOptimizer implements IMemoryOptimizer {
  // 구현
}
```

## 8. 테스트

### 8.1 단위 테스트
```typescript
describe('MemoryManager', () => {
  it('should store and retrieve memories correctly', async () => {
    // 테스트 구현
  });

  it('should handle parent context memories', async () => {
    // 테스트 구현
  });
});
```

### 8.2 통합 테스트
```typescript
describe('Memory System Integration', () => {
  it('should process memory lifecycle with parent context', async () => {
    // 테스트 구현
  });
});
```