# AI Learning Mentor Coaching Prompts

## 프롬프트 및 API 호출 정책(공통)

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

## 질문 전 코칭 (Pre-Coaching)

### 1. 핵심 키워드 추출
```
당신은 AI 학습 코치입니다. 사용자의 질문에서 핵심 키워드를 추출해주세요.

출력 형식:
- 키워드 태그 목록 (최대 5개)
- 각 키워드의 중요도 (1-5)
- 키워드 간의 관계 설명

예시:
질문: "React useEffect Hook에서 의존성 배열과 클린업 함수를 어떻게 사용해야 할까요?"

키워드:
- React (5)
- useEffect (5)
- 의존성 배열 (4)
- 클린업 함수 (4)
- Hook (3)

관계: React의 useEffect Hook에서 의존성 배열과 클린업 함수는 메모리 관리와 사이드 이펙트 제어에 중요한 요소입니다.
```

### 2. 질문 요약
```
사용자의 질문을 간단명료하게 요약해주세요.

출력 형식:
- 핵심 질문 (한 문장)
- 질문의 배경/맥락
- 구체적인 정보 요청 사항

예시:
핵심 질문: React useEffect Hook의 의존성 배열과 클린업 함수 사용에 대한 질문
배경: React 컴포넌트에서 비동기 작업 처리 시 발생하는 메모리 누수 문제
요청 사항: 의존성 배열과 클린업 함수를 효과적으로 사용하는 방법과 best practice
```

### 3. 카테고리 분류 및 목적 재정의
```
질문의 카테고리를 분류하고 목적을 명확히 정의해주세요.

출력 형식:
- 주 카테고리
- 세부 카테고리
- 학습 목적
- 예상되는 학습 결과

예시:
주 카테고리: React
세부 카테고리: Hooks, Best Practices
학습 목적: useEffect Hook의 고급 사용법 습득
예상 결과: 메모리 누수 없는 비동기 작업 처리 구현 능력 향상
```

### 4. 맥락 보강 제안
```
질문에 필요한 추가 맥락을 제안해주세요.

출력 형식:
- 필수 맥락 항목
- 선택적 맥락 항목
- 맥락 보강 방법

예시:
필수 맥락:
- 현재 구현 중인 컴포넌트의 목적
- useEffect 내부의 비동기 처리 방식
- 이전에 시도한 해결 방법

선택적 맥락:
- 프로젝트의 기술 스택
- 성능 요구사항
- 브라우저 호환성 요구사항
```

### 5. 질문 범위 최적화
```
질문의 범위를 최적화하여 더 효과적인 답변을 얻을 수 있도록 해주세요.

출력 형식:
- 핵심 주제
- 세부 포인트
- 제외할 범위
- 초점을 맞출 영역

예시:
핵심 주제: useEffect 의존성 관리
세부 포인트: 클린업 함수, 의존성 배열 최적화
제외 범위: 다른 Hook의 사용법, 상태 관리 전략
초점 영역: 비동기 작업의 메모리 누수 방지
```

### 6. 최적화된 질문 생성
```
분석 결과를 바탕으로 최적화된 질문을 생성해주세요.

입력:
- 원본 질문
- 추출된 키워드
- 질문 요약
- 카테고리와 목적
- 맥락 제안
- 범위 최적화

출력 형식:
- 최적화된 질문
- 개선된 점
- 예상되는 답변 품질 향상 요소

예시:
최적화된 질문:
"React useEffect Hook에서 의존성 배열과 클린업 함수를 효과적으로 사용하는 방법에 대해 알고 싶습니다. 특히 현재 구현 중인 컴포넌트에서 비동기 작업을 처리할 때 발생하는 메모리 누수 문제를 해결하고 싶습니다. 이전에 시도했던 방법들과 함께, 실제 프로덕션 환경에서 검증된 best practice를 공유해주시면 감사하겠습니다."

개선된 점:
- 구체적인 맥락 제공
- 명확한 목적 제시
- 실무 적용 가능성 강화
```

## 질문 후 코칭 (Post-Coaching)

### 1. 답변 분석
```
AI의 답변을 분석하고 학습 포인트를 추출해주세요.

출력 형식:
- 핵심 개념
- 실용적 적용점
- 추가 학습 필요 사항
- 실습 제안

예시:
핵심 개념:
- useEffect의 의존성 배열 동작 원리
- 클린업 함수의 실행 시점과 중요성
- 메모리 누수 방지 패턴

실용적 적용점:
- 비동기 작업 처리 시 클린업 함수 구현 방법
- 의존성 배열 최적화 전략
- 디버깅 및 모니터링 방법

추가 학습:
- React의 메모리 관리 메커니즘
- 비동기 작업의 라이프사이클
- 성능 최적화 기법

실습 제안:
- 타이머를 사용한 클린업 함수 구현
- 의존성 배열 최적화 실습
- 메모리 누수 테스트 및 해결
```

## 2. 질문 후 코칭 프롬프트

### 2.1 기억 저장 분석

#### 전역 기억 저장 분석
```prompt
현재 대화에서 전역적으로 유용한 정보를 식별하고 분석하세요.

출력 형식:
{
    "is_storable": boolean,    // 전역 기억으로 저장 가능 여부
    "keywords": string[],      // 관련 키워드 목록
    "reason": string,         // 저장 가능/불가능 이유
    "impact": number,         // 전역 영향도 (0-100)
    "summary": string         // 저장될 내용 요약
}
```

#### 프로젝트 기억 저장 분석
```prompt
현재 대화의 프로젝트 관련 정보를 식별하고 분석하세요.

출력 형식:
{
    "is_storable": boolean,    // 프로젝트 기억으로 저장 가능 여부
    "keywords": string[],      // 관련 키워드 목록
    "reason": string,         // 저장 가능/불가능 이유
    "impact": number,         // 프로젝트 영향도 (0-100)
    "summary": string         // 저장될 내용 요약
}
```

#### 대화방 기억 저장 분석
```prompt
현재 대화의 대화방 관련 정보를 식별하고 분석하세요.

출력 형식:
{
    "is_storable": boolean,    // 대화방 기억으로 저장 가능 여부
    "keywords": string[],      // 관련 키워드 목록
    "reason": string,         // 저장 가능/불가능 이유
    "impact": number,         // 대화방 영향도 (0-100)
    "summary": string         // 저장될 내용 요약
}
```

#### 서브대화방 기억 저장 분석
```prompt
현재 대화의 서브대화방 관련 정보를 식별하고 분석하세요.

출력 형식:
{
    "is_storable": boolean,    // 서브대화방 기억으로 저장 가능 여부
    "keywords": string[],      // 관련 키워드 목록
    "reason": string,         // 저장 가능/불가능 이유
    "impact": number,         // 서브대화방 영향도 (0-100)
    "summary": string         // 저장될 내용 요약
}
```

### 2.2 요청 형식 분석

#### 요청 패턴 감지
```prompt
현재 대화에서 특정한 요청 패턴이나 형식을 감지하세요.

출력 형식:
{
    "pattern_detected": boolean,   // 패턴 감지 여부
    "pattern_type": string,       // 감지된 패턴 유형 (table, markdown, summary 등)
    "pattern_example": string,    // 패턴 예시
    "applicability": {
        "global": boolean,        // 전역 적용 가능 여부
        "project": boolean,       // 프로젝트 적용 가능 여부
        "room": boolean          // 대화방 적용 가능 여부
    },
    "reason": string             // 패턴 분석 설명
}
```

### 2.3 기억 영향도 분석

#### 기억 영향 분석
```prompt
현재 응답이 기존 기억들로부터 받은 영향을 분석하세요.

출력 형식:
{
    "memory_impacts": {
        "global": {
            "impact_percentage": number,    // 전역 기억 영향도 (0-100)
            "key_memories": string[],       // 주요 영향을 준 기억들
            "impact_details": string        // 영향 상세 설명
        },
        "project": {
            "impact_percentage": number,    // 프로젝트 기억 영향도 (0-100)
            "key_memories": string[],       // 주요 영향을 준 기억들
            "impact_details": string        // 영향 상세 설명
        },
        "room": {
            "impact_percentage": number,    // 대화방 기억 영향도 (0-100)
            "key_memories": string[],       // 주요 영향을 준 기억들
            "impact_details": string        // 영향 상세 설명
        }
    },
    "overall_analysis": string             // 종합 분석
}
```

### 1.3 Context 기반 질문 추천
```prompt
사용자의 질문과 현재 제공된 context를 기반으로 더 효과적인 질문을 추천하세요.

입력:
{
    "user_question": string,          // 사용자의 원래 질문
    "contexts": {
        "global_memory": [            // 전역 기억 목록
            {
                "id": string,
                "content": string,
                "keywords": string[],
                "timestamp": string
            }
        ],
        "project_memory": [           // 프로젝트 기억 목록
            {
                "id": string,
                "content": string,
                "keywords": string[],
                "timestamp": string
            }
        ],
        "parent_room_memory": [       // 부모 채팅방 기억 목록
            {
                "id": string,
                "content": string,
                "keywords": string[],
                "timestamp": string
            }
        ],
        "parent_chat_history": [      // 부모 채팅 목록
            {
                "id": string,
                "question": string,
                "answer": string,
                "timestamp": string
            }
        ],
        "current_chat_history": [     // 현재 채팅 목록
            {
                "id": string,
                "question": string,
                "answer": string,
                "timestamp": string
            }
        ]
    }
}

출력 형식:
{
    "recommended_questions": [
        {
            "question": string,           // 추천 질문
            "reason": string,             // 추천 이유
            "used_contexts": [            // 활용된 context 정보
                {
                    "type": string,       // context 유형 (global_memory, project_memory 등)
                    "id": string,         // 참조된 context의 id
                    "relevance": number   // 연관도 (0-100)
                }
            ],
            "expected_benefits": string[] // 이 질문을 사용했을 때의 기대 효과
        }
    ],
    "context_analysis": {
        "relevant_contexts": [            // 현재 질문과 관련된 주요 context
            {
                "type": string,
                "id": string,
                "relevance": number,
                "key_points": string[]
            }
        ],
        "missing_contexts": [             // 추가로 필요할 수 있는 context
            {
                "type": string,
                "description": string,
                "reason": string
            }
        ]
    },
    "improvement_summary": string         // 전반적인 개선 포인트 요약
}
```

예시 응답:
```json
{
    "recommended_questions": [
        {
            "question": "React 컴포넌트의 성능 최적화 방법 중, 현재 프로젝트에서 사용 중인 메모이제이션 패턴의 개선 방안은 무엇인가요?",
            "reason": "프로젝트 기억에서 현재 메모이제이션 관련 이슈가 있음을 확인했고, 전역 기억의 React 최적화 패턴과 연계하여 구체적인 해결책을 얻을 수 있습니다.",
            "used_contexts": [
                {
                    "type": "project_memory",
                    "id": "mem_001",
                    "relevance": 95
                },
                {
                    "type": "global_memory",
                    "id": "mem_002",
                    "relevance": 85
                }
            ],
            "expected_benefits": [
                "현재 프로젝트의 구체적인 사례에 기반한 해결책 도출",
                "기존 최적화 패턴과의 연계를 통한 체계적인 개선",
                "프로젝트 특성에 맞는 커스텀 최적화 방안 수립"
            ]
        }
    ],
    "context_analysis": {
        "relevant_contexts": [
            {
                "type": "project_memory",
                "id": "mem_001",
                "relevance": 95,
                "key_points": [
                    "현재 메모이제이션 관련 성능 이슈 존재",
                    "특정 컴포넌트에서 불필요한 리렌더링 발생"
                ]
            }
        ],
        "missing_contexts": [
            {
                "type": "parent_room_memory",
                "description": "이전 성능 최적화 시도 기록",
                "reason": "과거 시도했던 최적화 방안과의 비교 필요"
            }
        ]
    },
    "improvement_summary": "프로젝트의 실제 사례와 전역적인 최적화 패턴을 연계하여 질문을 구체화했습니다. 특히 현재 발생 중인 성능 이슈에 초점을 맞추어 실용적인 해결책을 얻을 수 있도록 질문을 구성했습니다."
}
```