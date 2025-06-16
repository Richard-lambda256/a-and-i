# 코딩 컨벤션 가이드

## 1. 파일 및 디렉토리 구조

### 1.1 명명 규칙
- 파일명은 케밥 케이스 사용 (예: `chat-message.tsx`)
- 컴포넌트 파일명은 기능을 명확히 표현 (예: `pre-coaching.tsx`)
- 테스트 파일은 `.test.tsx` 또는 `.spec.tsx` 확장자 사용
- 유틸리티 함수는 기능별로 분리 (예: `date-utils.ts`, `string-utils.ts`)

### 1.2 디렉토리 구조
```
src/
  app/              # Next.js App Router 페이지
  components/       # 재사용 가능한 컴포넌트
    ui/            # shadcn/ui 컴포넌트
    [feature]/     # 기능별 컴포넌트
  lib/             # 유틸리티 및 설정
    store/         # Zustand 스토어
    utils/         # 유틸리티 함수
    hooks/         # 커스텀 훅
    types/         # TypeScript 타입 정의
  styles/          # 전역 스타일
```

## 2. TypeScript

### 2.1 타입 정의
```typescript
// 인터페이스 명명
interface IComponentProps {
  // ...
}

// 타입 명명
type ComponentState = {
  // ...
}

// 열거형 명명
enum ComponentType {
  // ...
}
```

### 2.2 타입 임포트
```typescript
// 올바른 방법
import type { ComponentProps } from './types';

// 잘못된 방법
import { ComponentProps } from './types';
```

### 2.3 제네릭 사용
```typescript
// 올바른 방법
function getItems<T>(items: T[]): T[] {
  return items;
}

// 잘못된 방법
function getItems(items: any[]): any[] {
  return items;
}
```

## 3. React/Next.js

### 3.1 컴포넌트 구조
```typescript
// components/feature/feature-component.tsx
import type { ComponentProps } from './types';

export function FeatureComponent({ prop1, prop2 }: ComponentProps) {
  // 훅은 최상단에 위치
  const { data } = useFeatureData();

  // 이벤트 핸들러
  const handleClick = () => {
    // ...
  };

  // 조건부 렌더링을 위한 변수
  const renderContent = () => {
    if (condition) {
      return <ComponentA />;
    }
    return <ComponentB />;
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}
```

### 3.2 훅 규칙
```typescript
// lib/hooks/use-feature.ts
export function useFeature(id: string) {
  // 상태는 최상단에 정의
  const [data, setData] = useState<Data | null>(null);

  // 부수 효과는 명확한 의존성 배열 사용
  useEffect(() => {
    // ...
  }, [id]);

  // 메모이제이션이 필요한 경우
  const memoizedValue = useMemo(() => {
    // ...
  }, [data]);

  return { data, memoizedValue };
}
```

## 4. 스타일링

### 4.1 TailwindCSS
```typescript
// 올바른 방법
<div className="flex items-center space-x-4 p-4">
  <div className="flex-1">
    <h2 className="text-xl font-semibold">제목</h2>
    <p className="text-gray-600">내용</p>
  </div>
</div>

// 잘못된 방법
<div className="flex items-center p-4 space-x-4"> // 순서가 잘못됨
  <div className="flex-1">
    <h2 className="font-semibold text-xl">제목</h2> // 순서가 잘못됨
    <p className="text-gray-600">내용</p>
  </div>
</div>
```

### 4.2 shadcn/ui
```typescript
// 올바른 방법
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>

// 잘못된 방법
<Card>
  <div className="p-4"> // CardHeader를 사용하지 않음
    <h2>제목</h2>
    <p>설명</p>
  </div>
  <div className="p-4"> // CardContent를 사용하지 않음
    내용
  </div>
</Card>
```

## 5. 상태 관리 (Zustand)

### 5.1 스토어 구조
```typescript
// lib/store/feature-store.ts
interface FeatureState {
  data: Data[];
  status: 'idle' | 'loading' | 'error';
  error: Error | null;
}

interface FeatureActions {
  setData: (data: Data[]) => void;
  setStatus: (status: FeatureState['status']) => void;
  setError: (error: Error | null) => void;
}

export const useFeatureStore = create<FeatureState & FeatureActions>((set) => ({
  data: [],
  status: 'idle',
  error: null,
  setData: (data) => set({ data }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
}));
```

### 5.2 스토어 사용
```typescript
// components/feature/feature-list.tsx
export function FeatureList() {
  // 필요한 상태만 선택
  const data = useFeatureStore((state) => state.data);
  const status = useFeatureStore((state) => state.status);

  // 여러 상태를 한번에 선택할 때는 객체 구조 분해 할당
  const { setData, setStatus } = useFeatureStore();

  return (
    // ...
  );
}
```

## 6. 테스트

### 6.1 컴포넌트 테스트
```typescript
// components/feature/feature-component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureComponent } from './feature-component';

describe('FeatureComponent', () => {
  it('renders correctly', () => {
    render(<FeatureComponent />);
    expect(screen.getByText('제목')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClickMock = jest.fn();
    render(<FeatureComponent onClick={onClickMock} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalled();
  });
});
```

### 6.2 훅 테스트
```typescript
// lib/hooks/use-feature.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFeature } from './use-feature';

describe('useFeature', () => {
  it('updates data correctly', () => {
    const { result } = renderHook(() => useFeature('test-id'));

    act(() => {
      result.current.setData([{ id: 1 }]);
    });

    expect(result.current.data).toEqual([{ id: 1 }]);
  });
});
```

## 7. 린트 및 포맷팅

### 7.1 ESLint 설정
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    node: true,
  },
  plugins: ['import'],
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/stylistic',
    'plugin:unicorn/recommended',
    'plugin:sonarjs/recommended-legacy',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    'prettier/prettier': 'error',

    // Tailwind 설정
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/classnames-order': 'error',
    'tailwindcss/enforces-shorthand': 'error',
    'tailwindcss/migration-from-tailwind-2': 'error',
    'tailwindcss/no-unnecessary-arbitrary-value': 'error',

    // 기타 설정
    'unicorn/filename-case': 'off',
    '@next/next/no-img-element': 'off',
    'import/no-named-as-default': 'off',
    'sonarjs/void-use': 'off',
    'sonarjs/todo-tag': 'off',
    'sonarjs/fixme-tag': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
```

### 7.2 Prettier 설정
```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "endOfLine": "lf"
}
```

## 8. Git

### 8.1 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 8.2 브랜치 전략
```
main: 프로덕션 브랜치
develop: 개발 브랜치
feature/*: 기능 개발 브랜치
bugfix/*: 버그 수정 브랜치
release/*: 릴리즈 준비 브랜치
```