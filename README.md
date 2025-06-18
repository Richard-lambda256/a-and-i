# A&I: AI Coaching & Insight Service

## 과제 개요

A&I는 Google Gemini 기반의 AI 코칭/챗봇 서비스입니다.
사용자의 질문 품질을 높이고, 대화 맥락(기억/가이드라인/이력)을 AI에 효과적으로 전달하여
실질적인 성장과 인사이트를 제공하는 것을 목표로 합니다.

- **주요 기술:** Next.js, TypeScript, Prisma, Zustand, shadcn/ui, Google Generative AI SDK
- **AI 모델:** Gemini 2.0 Flash (API Key 필요, 사용자는 직접 등록)
- **서비스 구조:** 프로젝트/대화방/대화 단위의 트리 구조, 인사이트 맵, 코칭 패널 등

---

## 기획

### 1. 서비스 플로우

- **API Key 등록:** 최초 진입 시 Gemini API Key가 없으면 등록 화면으로 이동.
  등록 후 모든 AI 호출에 Bearer 인증 방식으로 사용.
- **프로젝트/대화방/대화:**
  - 프로젝트 생성 → 대화방 생성 → 대화 생성(자동/수동)
  - 트리 구조로 탐색, 대화만 선택 가능
- **대화 전 코칭:**
  - 질문 입력 → AI가 질문 품질 개선/키워드/요약/추천 질문 제안
- **AI 질문:**
  - 개선된 질문으로 Gemini에 실제 질의, 답변 수신
- **대화 후 코칭:**
  - 답변 분석(핵심 키워드, 요약, 패턴, 영향도 등)
  - 기억(메모리) 저장: 전역/프로젝트/대화별로 1회 저장, 인사이트맵에 즉시 반영

### 2. 프롬프트/컨텍스트 정책

- **계층적 context:**
  - `[전역 기억] → [프로젝트 기억/지침] → [대화 이력] → [사용자 질문]`
  - 모든 AI 호출 시 context를 스택 형태로 프롬프트에 포함
- **실제 프롬프트 예시:**
  - **Pre-coaching 프롬프트:**
    - 사용자의 질문을 분석하여 더 효과적인 질문으로 재구성하는 코치 역할
    - JSON 형식으로 keywords, summary, context_suggestions, optimized_question 제공
  - **Ask 프롬프트:**
    - 전문적인 AI 응답 분석 코치 역할
    - JSON 형식으로 answer(Markdown), keywords, summary, follow_up_questions 제공

### 3. UI/UX

- **SF/HUD 스타일:** shadcn/ui, Tailwind, Orbitron 폰트, 네온/글래스 효과
- **상태 관리:** Zustand 기반, 프로젝트/대화/메모리 등 동기화
- **방어적 UX:** API Key/프로젝트 미입력 등 예외 상황 안내 및 처리

---

## 구현

### 1. 주요 기능

- **Gemini API 연동:**
  - 공식 SDK(@google/generative-ai) 사용, API Key는 Bearer로 전달
  - 프론트/백엔드 모두 인증/에러 처리 일관성 확보
- **프롬프트/컨텍스트 관리:**
  - 프롬프트는 사용 내역으로만 저장, 실제 프롬프트는 코드 내 함수로 관리
  - context 조합 및 전달 자동화
- **프로젝트/대화방/대화 관리:**
  - 트리 탐색기, 자동 생성, 상태 동기화, CRUD API
- **코칭 패널:**
  - 대화 전/후 코칭, 질문 개선, 답변 분석, 기억 저장 UI
- **메모리(기억) 시스템:**
  - 전역/프로젝트/대화별 기억 저장, 인사이트맵 실시간 반영
  - 저장 성공 시 window.dispatchEvent('refreshMemories')로 패널 갱신
- **방어적 코딩/에러 처리:**
  - API Key/프로젝트 미입력, 401/403/400 에러 등 예외 처리
  - Prisma 모델, Next.js 라우트, 상태 관리 등에서 방어 코드 적용

### 2. 폴더 구조(일부)

```
src/
  app/
    ai/
      key/         # API Key 등록/수정 페이지
      chat/        # 메인 대화/코칭/인사이트맵 UI
    api/
      key/         # API Key 관리 API
      projects/    # 프로젝트/대화방/대화 API
      coaching/    # 코칭(pre/post) API
      ai/ask/      # Gemini AI 질문 API
  components/
    explorer/      # 프로젝트/대화방/대화 트리
    chat/          # 코칭/대화/인사이트맵 패널
  lib/
    prompts.ts     # 프롬프트 관리 유틸리티
    store/         # Zustand 상태 관리
```

---

## Getting Started

1. 의존성 설치
   ```bash
   pnpm install
   ```

2. 개발 서버 실행
   ```bash
   pnpm dev
   ```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 참고/문서

- [docs/development/README.md](docs/development/README.md)
- [docs/development/guides/prompt-management.md](docs/development/guides/prompt-management.md)
- [docs/development/guides/memory-management.md](docs/development/guides/memory-management.md)
- [docs/development/guides/coaching-system.md](docs/development/guides/coaching-system.md)
- 기타 상세 정책/구현은 docs/ 및 소스코드 주석 참고

---

## License

MIT
