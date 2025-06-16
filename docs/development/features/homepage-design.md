# A&I Homepage/서비스 구조 최신화

## 1. 서비스 개요 및 정책
- 해커톤 프로젝트로 복잡한 기능 최소화, 단순한 구조 지향
- AI 호출은 Gemini API 사용
- 최초 진입 시 localStorage에 Gemini API Key 확인, 없으면 /ai/key로 리다이렉트
- /ai/key: **코치 설정** 화면에서 API Key 등록/수정, 모델은 'gemini-2.0-flash'로 고정된 셀렉트 박스 제공, 완료 시 /ai/chat 이동
- 모든 AI 서비스 호출(대화전 코칭, AI 질문, 대화후 코칭 등)은 반드시 사용자가 등록한 gemini-2.0-flash API Key를 이용해 호출함
- API Key는 모든 API 호출 시 user 식별자로 전달, localStorage+전역상태에 저장

## 2. 메인 서비스 구조(/ai/chat)
- 상단(100%-300px):
  - 좌측: 대화 탐색기(300px)
  - 우측: 메인 작업 영역
- 하단(300px): 인사이트 맵(현재 대화에 영향을 준 전역/프로젝트/대화 기억 시각화)

### 2.1 대화 탐색기
- 상단: 로고, 프로젝트 생성 버튼
- 트리: 프로젝트들 → 대화방들 → 대화들(서브대화방 없음)
- 프로젝트/대화방은 접기/펼치기만 가능, 선택 불가
- 대화만 선택 가능(항상 대화 하나가 선택된 상태)

### 2.2 대화/코칭 플로우
- 최초 API Key 등록 시 new project 1개, new chat 1개 자동 생성 및 선택
- 대화 상태: new chat → 대화전코칭완료 → 대화후코칭완료
- new chat: 질문 입력, 코칭 버튼 클릭 → 대화전 코칭
- 대화전코칭완료: 코칭 결과(질문 그대로/최적화/수정) 중 선택하여 대화 진행
- 대화후코칭완료: 대화 결과, 기억 추가, 패턴 감지/적용, 영향 분석, new chat 버튼 활성화

### 2.3 인사이트 맵
- 하단 300px 고정, 현재 대화에 영향을 준 전역/프로젝트/이전 대화 시각화

## 3. 디자인 컨셉
- shadcn/ui 테마 시스템, Tailwind 확장, CSS Variables, Orbitron 폰트 기반 SF/HUD(미래 소프트웨어) 스타일
- wireframe/ai_chat.html 감성, 네온/글래스 효과, 색상 토큰, variant 확장 등 적용
- 실제 코드/설정 예시는 기존 SF/HUD 테마 예시 참고

```css
/* globals.css 또는 theme-sci-fi.css */
.theme-sci-fi {
  --background: #0a0f1c;
  --foreground: #e0f7ff;
  --primary: #00f6ff;
  --primary-foreground: #0a0f1c;
  --secondary: #ff0088;
  --secondary-foreground: #0a0f1c;
  --accent: #00ff9f;
  --accent-foreground: #0a0f1c;
  --muted: #1f2733;
  --muted-foreground: #6c829b;
  --border: #1e2a3a;
  --input: #2c3e50;
  --ring: #00f6ff;
  --destructive: #ff0055;
  --destructive-foreground: #ffffff;
  --card: #0a0f1c;
  --card-foreground: #e0f7ff;
  --popover: #0a0f1c;
  --popover-foreground: #e0f7ff;
}
```

```ts
// tailwind.config.ts
extend: {
  colors: {
    neon: {
      blue: '#00f6ff',
      pink: '#ff0088',
      green: '#00ff9f',
      red: '#ff0055',
    },
    sciFiBg: '#0a0f1c',
  },
  boxShadow: {
    neon: '0 0 8px #00f6ff, 0 0 16px #00f6ff',
    neonInset: 'inset 0 0 8px #00f6ff',
  },
  fontFamily: {
    hud: ['Orbitron', 'sans-serif'],
  },
  keyframes: {
    glow: {
      '0%, 100%': { boxShadow: '0 0 4px #00f6ff, 0 0 8px #00f6ff' },
      '50%': { boxShadow: '0 0 12px #00f6ff, 0 0 24px #00f6ff' },
    },
  },
  animation: {
    glow: 'glow 1s ease-in-out infinite',
  },
}
```

- Orbitron 폰트는 Google Fonts에서 불러오기.
- shadcn/ui variant 확장 예시:

```tsx
<Button
  className="bg-[var(--primary)] text-[var(--primary-foreground)] font-hud shadow-neon border border-[var(--primary)] hover:brightness-125"
>
  ACTIVATE
</Button>
```

- SF UI 효과 팁: backdrop-blur-sm + bg-opacity-20(글래스), border-dashed + animate-pulse(HUD), ring-2 ring-[var(--ring)](인터랙션), motion-safe:animate-glow(네온 애니메이션)

## 4. 프롬프트 및 AI API 호출 정책

- 모든 AI 관련 프롬프트 및 API 호출 시, 아래와 같이 context를 계층적으로 스택 형태로 모아 프롬프트에 포함시킴
- context는 전역 기억 → 프로젝트 기억 → 대화 이력 순서로 쌓임
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

## 5. 홈페이지 기획 및 프로젝트 개요

### 5.1 기본 정보
- **프로젝트명**: A & I (AI, AI and I, Ask & Improve)
- **목적**: AI에게 질문하고, 질문 자체를 개선받으며 AI 활용 능력을 향상시키는 개인화 코칭 웹툴
- **플랫폼**: 웹 전용 (앱 미제공)
- **개발 환경**:
  - Next.js (App Router)
  - TypeScript
  - TailwindCSS
  - OpenAI/Claude API

### 5.2 디자인 컨셉

- 본 프로젝트의 UI/UX는 shadcn/ui의 테마 시스템과 Tailwind 확장, CSS Variables를 활용한 SF/HUD(미래 소프트웨어) 스타일을 표준으로 삼습니다.
- 디자인 토큰, 폰트, 네온/글래스 효과, 인터랙션 등은 wireframe/ai_chat.html 및 아래 테마 가이드를 준수합니다.
- 주요 색상, 폰트, 애니메이션, 컴포넌트 스타일은 theme-sci-fi, tailwind.config.ts, Orbitron 폰트, shadcn/ui variant 확장 등으로 관리합니다.

### SF/HUD 테마 예시

```css
/* globals.css 또는 theme-sci-fi.css */
.theme-sci-fi {
  --background: #0a0f1c;
  --foreground: #e0f7ff;
  --primary: #00f6ff;
  --primary-foreground: #0a0f1c;
  --secondary: #ff0088;
  --secondary-foreground: #0a0f1c;
  --accent: #00ff9f;
  --accent-foreground: #0a0f1c;
  --muted: #1f2733;
  --muted-foreground: #6c829b;
  --border: #1e2a3a;
  --input: #2c3e50;
  --ring: #00f6ff;
  --destructive: #ff0055;
  --destructive-foreground: #ffffff;
  --card: #0a0f1c;
  --card-foreground: #e0f7ff;
  --popover: #0a0f1c;
  --popover-foreground: #e0f7ff;
}
```

```ts
// tailwind.config.ts
extend: {
  colors: {
    neon: {
      blue: '#00f6ff',
      pink: '#ff0088',
      green: '#00ff9f',
      red: '#ff0055',
    },
    sciFiBg: '#0a0f1c',
  },
  boxShadow: {
    neon: '0 0 8px #00f6ff, 0 0 16px #00f6ff',
    neonInset: 'inset 0 0 8px #00f6ff',
  },
  fontFamily: {
    hud: ['Orbitron', 'sans-serif'],
  },
  keyframes: {
    glow: {
      '0%, 100%': { boxShadow: '0 0 4px #00f6ff, 0 0 8px #00f6ff' },
      '50%': { boxShadow: '0 0 12px #00f6ff, 0 0 24px #00f6ff' },
    },
  },
  animation: {
    glow: 'glow 1s ease-in-out infinite',
  },
}
```

- Orbitron 폰트는 Google Fonts에서 불러오기.
- shadcn/ui variant 확장 예시:

```tsx
<Button
  className="bg-[var(--primary)] text-[var(--primary-foreground)] font-hud shadow-neon border border-[var(--primary)] hover:brightness-125"
>
  ACTIVATE
</Button>
```

- SF UI 효과 팁: backdrop-blur-sm + bg-opacity-20(글래스), border-dashed + animate-pulse(HUD), ring-2 ring-[var(--ring)](인터랙션), motion-safe:animate-glow(네온 애니메이션)

## 5. 홈페이지(`/`) 기획

### 5.1 목적
- 사용자에게 A & I 서비스의 **핵심 컨셉과 차별점**을 빠르게 전달
- **AI 활용 능력을 향상시킬 수 있는 개인화 도구**임을 강조
- 즉시 `/ai`로 이동하거나 API Key를 등록하도록 유도

### 5.2 주요 섹션 구성

| 섹션 | 내용 | 구현 가이드 |
|------|------|------------|
| Hero 섹션 | "AI를 더 똑똑하게 쓰는 법, A & I에서 시작하세요" + CTA 버튼 | ```tsx
const HeroSection = () => (
  <section className="min-h-[80vh] flex items-center">
    <div className="container mx-auto px-4">
      <h1 className="text-5xl font-bold">
        AI를 더 똑똑하게 쓰는 법,<br/>
        A & I에서 시작하세요
      </h1>
      <CTAButton />
    </div>
  </section>
)
``` |
| 기능 요약 섹션 | Insight Map, 질문 코칭, 다중 응답 탭 비교 등 핵심 기능 미리보기 | ```tsx
const FeaturesSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto grid grid-cols-3 gap-8">
      <FeatureCard
        title="Insight Map"
        description="..."
      />
      {/* 추가 기능 카드 */}
    </div>
  </section>
)
``` |
| 사용 흐름 | "질문 → 코칭 → 응답 → 요약/확장" 흐름을 이미지 또는 아이콘으로 표현 | ```tsx
const WorkflowSection = () => (
  <section className="py-20">
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <WorkflowStep step={1} label="질문" />
        <Arrow />
        <WorkflowStep step={2} label="코칭" />
        {/* 추가 단계 */}
      </div>
    </div>
  </section>
)
``` |
| 예시 시나리오 | 질문 개선/프롬프트 추천의 전후 비교 예시 | ```tsx
const ExampleSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto">
      <ComparisonCard
        before="원래 질문"
        after="개선된 질문"
      />
    </div>
  </section>
)
``` |
| API 연결 안내 | API Key 등록을 위한 설명 및 도움말 링크 | ```tsx
const APIGuideSection = () => (
  <section className="py-20">
    <div className="container mx-auto">
      <h2>API Key 등록하기</h2>
      <APIKeyForm />
      <HelpLinks />
    </div>
  </section>
)
``` |
| 하단 푸터 | - GitHub 링크 (https://github.com/nodit-developers/Lambda_Hackathon_2025)<br/>- 해커톤 이름 (Lambda Hackathon 2025)<br/>- 개발자 이메일 (Richard, richard@lambda256.io) | ```tsx
const Footer = () => (
  <footer className="py-10 bg-gray-900 text-white">
    <div className="container mx-auto">
      <div className="flex justify-between">
        <div>
          <a href="https://github.com/nodit-developers/Lambda_Hackathon_2025">
            GitHub
          </a>
        </div>
        <div>Lambda Hackathon 2025</div>
        <div>richard@lambda256.io</div>
      </div>
    </div>
  </footer>
)
``` |

### 5.3 URL 구조 및 이동 흐름

| 경로 | 기능 | 구현 가이드 |
|------|------|------------|
| `/` | 홈페이지 (소개/유도용) | ```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <ExampleSection />
      <APIGuideSection />
      <Footer />
    </>
  )
}
``` |
| `/ai` | 본 서비스 진입 → API Key 여부 확인 | ```tsx
// app/ai/page.tsx
export default function AIPage() {
  const hasApiKey = useHasApiKey();

  useEffect(() => {
    if (!hasApiKey) {
      router.push('/ai/key');
    }
  }, [hasApiKey]);

  return <AIInterface />;
}
``` |
| `/ai/key` | **코치 설정** (API Key 등록/수정, 모델은 'gemini-2.0-flash'로 고정) | ```tsx
// app/ai/key/page.tsx
export default function APIKeyPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold neon mb-6">코치 설정</h1>
      <form>
        <label className="block mb-2 sf-label">Gemini API Key</label>
        <input type="password" className="sf-input w-full mb-4" placeholder="API Key를 입력하세요" />
        <label className="block mb-2 sf-label">모델</label>
        <select className="sf-input w-full mb-6" disabled>
          <option value="gemini-2.0-flash">gemini-2.0-flash (고정)</option>
        </select>
        <button className="neon-btn px-6 py-2 rounded-xl font-bold">저장</button>
      </form>
    </div>
  );
}
``` |
| `/ai/chat` | 전체 기능 제공 | ```tsx
// app/ai/chat/page.tsx
export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <ChatUI />
      <CoachingPanel />
      <InsightMap />
    </div>
  );
}
``` |

## 6. 컴포넌트 구조

### 6.1 공통 컴포넌트
```typescript
// components/common/cta-button.tsx
export function CTAButton() {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={() => router.push('/ai')}
    >
      시작하기
    </Button>
  );
}

// components/common/feature-card.tsx
export function FeatureCard({
  title,
  description,
  icon
}: FeatureCardProps) {
  return (
    <Card className="p-6">
      <Icon name={icon} />
      <h3 className="text-xl font-bold">{title}</h3>
      <p>{description}</p>
    </Card>
  );
}
```

### 6.2 레이아웃
```typescript
// app/layout.tsx
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 7. 상태 관리

### 7.1 API Key 관리
```typescript
// lib/store/api-key-store.ts
interface APIKeyState {
  hasKey: boolean;
  setHasKey: (has: boolean) => void;
  validateKey: (key: string) => Promise<boolean>;
}

export const useAPIKeyStore = create<APIKeyState>((set) => ({
  hasKey: false,
  setHasKey: (has) => set({ hasKey: has }),
  validateKey: async (key) => {
    // 키 검증 로직
    return true;
  },
}));
```