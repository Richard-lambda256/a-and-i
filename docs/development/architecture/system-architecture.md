# AI Learning Mentor System 아키텍처

## 1. 시스템 개요

### 1.1 목적
- AI 기반 학습 코칭 시스템 구축
- 사용자의 질문 품질 향상 및 학습 효과 극대화
- 체계적인 학습 경로 제공

### 1.2 핵심 기능
1. 질문 전 코칭
   - 키워드 추출 및 분석
   - 질문 최적화 및 추천
   - 맥락 보강
   - 범위 최적화

2. 질문 후 코칭
   - 답변 분석
   - 학습 경로 제안
   - 실무 적용 가이드
   - 심화 학습 제안

## 2. 기술 스택

### 2.1 프론트엔드
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand (상태 관리)

### 2.2 개발 환경
- ESLint & Prettier
- Jest & React Testing Library
- Husky & lint-staged
- TypeScript strict 모드

### 2.3 배포 환경
- Vercel
- Edge Runtime
- Serverless Functions

## 3. 시스템 아키텍처

### 3.1 프로젝트 구조
```
src/
  app/
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
    (chat)/
      [project-id]/
        [room-id]/
          page.tsx
          loading.tsx
          error.tsx
    api/
      chat/
        route.ts
      memory/
        route.ts
      coaching/
        route.ts
  components/
    ui/
    chat/
    coaching/
    memory/
  lib/
    store/
    utils/
    hooks/
    types/
  styles/
    globals.css
```

### 3.2 상태 관리
```typescript
// 채팅 상태
interface ChatStore {
  messages: Message[];
  contexts: ChatContext;
  addMessage: (message: Message) => void;
  updateContext: (context: Partial<ChatContext>) => void;
}

// 코칭 상태
interface CoachingStore {
  preCoaching: PreCoachingState;
  postCoaching: PostCoachingState;
  updatePreCoaching: (state: Partial<PreCoachingState>) => void;
  updatePostCoaching: (state: Partial<PostCoachingState>) => void;
}

// 메모리 상태
interface MemoryStore {
  globalMemory: Memory[];
  projectMemory: Memory[];
  roomMemory: Memory[];
  updateMemory: (type: MemoryType, memory: Memory[]) => void;
}
```

## 4. 메모리 관리 시스템

### 4.1 메모리 계층 구조
1. **전역 메모리 (Global Memory)**
   - 모든 프로젝트와 대화방에서 접근 가능
   - 시스템 전체의 공유 지식 저장
   - 사용자의 학습 이력과 선호도 포함

2. **프로젝트 메모리 (Project Memory)**
   - 해당 프로젝트 내 모든 대화방에서 접근 가능
   - 프로젝트별 컨텍스트와 지식 저장
   - 프로젝트 학습 진행 상황 포함

> **프로젝트 지침 (Guideline/Instruction)**
> - 각 프로젝트는 별도의 지침(가이드라인/인스트럭션)을 가질 수 있음
> - 지침은 프로젝트별로 1개(또는 최신 1개)만 관리
> - 지침은 메모리와 별개로 프로젝트의 운영 원칙, 목표, 대화 가이드 등을 명시

3. **대화방 메모리 (Room Memory)**
   - 현재 대화방과 하위 대화방에서 접근 가능
   - 대화 컨텍스트와 맥락 저장
   - 부모 대화방의 컨텍스트 참조

### 4.2 메모리 저장 규칙
1. **저장 범위**
   - 전역/프로젝트 메모리: 모든 대화방에서 저장 가능
   - 대화방 메모리: 해당 대화방과 하위 대화방에서 저장 가능
   - 계층 구조의 깊이에 제한 없음

2. **접근 권한**
   - 전역 메모리: 전체 읽기 가능
   - 프로젝트 메모리: 프로젝트 내 읽기 가능
   - 대화방 메모리: 해당 대화방과 하위 대화방에서 읽기 가능

3. **영향도 관리**
   - 메모리 유형별 영향도 계산 (0-100%)
   - 계층 구조 깊이에 따른 가중치 적용
   - 부모-자식 관계의 영향도 연계

## 5. 프로젝트 지침 관리

### 5.1 목적
- 프로젝트별 운영 원칙, 목표, 대화 가이드, 참고사항 등을 명확히 기록
- 팀원/참여자 간 일관된 목표 공유

### 5.2 데이터 흐름
- 프로젝트 생성/수정 시 지침 입력 가능
- 프로젝트 상세 페이지에서 지침 확인 및 수정 가능
- API: `/api/guideline` (POST/GET)
- DB: `project_guidelines` 테이블

### 5.3 UI/UX
- 프로젝트 상세 화면에 지침 영역 고정 노출
- 지침이 없는 경우 입력 유도
- 지침은 프로젝트별 1개(최신)만 관리

## 6. 코칭 시스템

### 6.1 질문 전 코칭 프로세스
1. 사용자 질문 입력
2. 컨텍스트 수집 및 분석
3. 키워드 추출 및 분류
4. 질문 최적화 추천
5. 사용자 선택/수정

### 6.2 질문 후 코칭 프로세스
1. AI 답변 분석
2. 학습 경로 생성
3. 실무 적용 방안 제시
4. 심화 학습 추천
5. 메모리 저장 결정

### 6.3 컨텍스트 처리
1. **수집 대상**
   - 전역 메모리
   - 프로젝트 메모리
   - 부모 대화방 메모리
   - 채팅 히스토리

2. **처리 과정**
   - 데이터 구조화
   - 키워드 추출
   - 연관도 계산
   - 우선순위화

## 7. 성능 및 모니터링

### 7.1 성능 지표
- 응답 시간
- 메모리 사용량
- API 호출 빈도
- 에러 발생률

### 7.2 모니터링 항목
- 사용자 행동 패턴
- 메모리 저장 패턴
- 코칭 효과 측정
- 시스템 리소스 사용

### 7.3 로깅
- 에러 로그
- 성능 로그
- 사용자 행동 로그
- 메모리 접근 로그

## 8. 보안

### 8.1 인증/인가
- JWT 기반 인증
- RBAC 권한 관리
- API 키 관리

### 8.2 데이터 보안
- 암호화 저장
- 전송 구간 암호화
- 개인정보 보호

### 8.3 접근 제어
- API 레이트 리미팅
- IP 기반 접근 제어
- 세션 관리