# 페이지 구조 및 UX/기능 정책 최신화

## 1. 서비스 정책
- 해커톤 프로젝트로 복잡한 기능 최소화, 단순한 구조
- AI 호출은 Gemini API 사용
- 최초 진입 시 localStorage에 Gemini API Key 확인, 없으면 /ai/key로 리다이렉트
- /ai/key: **코치 설정** 화면에서 API Key 등록/수정, 모델은 'gemini-2.0-flash'로 고정된 셀렉트 박스 제공, 완료 시 /ai/chat 이동
- 모든 AI 서비스 호출(대화전 코칭, AI 질문, 대화후 코칭 등)은 반드시 사용자가 등록한 gemini-2.0-flash API Key를 이용해 호출함
- API Key는 모든 API 호출 시 user 식별자로 전달, localStorage+전역상태에 저장

## 2. URL 및 인증 흐름
- /ai/key: Gemini API Key 등록/수정
- /ai/chat: 메인 서비스(항상 대화 하나가 선택된 상태)

## 3. /ai/chat 레이아웃
- 상단(100%-300px):
  - 좌측: 대화 탐색기(300px)
  - 우측: 메인 작업 영역
- 하단(300px): 인사이트 맵(현재 대화에 영향을 준 전역/프로젝트/대화 기억 시각화)

### 3.1 대화 탐색기
- 상단: 로고, 프로젝트 생성 버튼
- 트리: 프로젝트들 → 대화방들 → 대화들(서브대화방 없음)
- 프로젝트/대화방은 접기/펼치기만 가능, 선택 불가
- 대화만 선택 가능(항상 대화 하나가 선택된 상태)

### 3.2 대화/코칭 플로우
- 최초 API Key 등록 시 new project 1개, new chat 1개 자동 생성 및 선택
- 대화 상태: new chat → 대화전코칭완료 → 대화후코칭완료
- new chat: 질문 입력, 코칭 버튼 클릭 → 대화전 코칭
- 대화전코칭완료: 코칭 결과(질문 그대로/최적화/수정) 중 선택하여 대화 진행
- 대화후코칭완료: 대화 결과, 기억 추가, 패턴 감지/적용, 영향 분석, new chat 버튼 활성화

### 3.3 인사이트 맵
- 하단 300px 고정, 현재 대화에 영향을 준 전역/프로젝트/이전 대화 시각화

## 4. 디자인 컨셉
- shadcn/ui 테마 시스템, Tailwind 확장, CSS Variables, Orbitron 폰트 기반 SF/HUD(미래 소프트웨어) 스타일
- wireframe/ai_chat.html 감성, 네온/글래스 효과, 색상 토큰, variant 확장 등 적용
- 실제 코드/설정 예시는 기존 SF/HUD 테마 예시 참고

## 5. 프롬프트 및 AI API 호출 정책

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
