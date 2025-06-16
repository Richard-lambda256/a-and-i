# API 문서화

## 개요
이 문서는 A&I 프로젝트의 API 엔드포인트, 요청/응답 형식, 인증 방식, 예시, 에러 코드 등을 설명합니다.

---

## 인증 방식
- 모든 API는 API Key(로컬스토리지에 암호화 저장)를 통해 인증합니다.
- 요청 헤더에 `Authorization: Bearer <API_KEY>` 형식으로 전달합니다.

---

## 공통 사항
- Base URL: `/api`
- Content-Type: `application/json`
- 모든 응답은 JSON 형식입니다.

---

## 엔드포인트 목록

### 1. API Key 관리
#### POST `/api/key`
- 설명: API Key 등록/수정
- 요청: `{ "key": "string" }`
- 응답: `{ "id": "string", "created_at": "string" }`

---

### 2. 프로젝트 관리
#### GET `/api/projects`
- 설명: 프로젝트 목록 조회
- 응답: `[ { "id": "string", "name": "string", ... } ]`

#### POST `/api/projects`
- 설명: 프로젝트 생성
- 요청: `{ "name": "string", "guideline": "string" }`
- 응답: `{ "id": "string", ... }`

#### PATCH `/api/projects/{id}`
- 설명: 프로젝트 정보 수정
- 요청: `{ "name": "string", "guideline": "string" }`
- 응답: `{ "id": "string", ... }`

#### DELETE `/api/projects/{id}`
- 설명: 프로젝트 삭제
- 응답: `{ "success": true }`

---

### 3. 챗룸 관리
#### GET `/api/projects/{projectId}/chatrooms`
- 설명: 챗룸 목록 조회
- 응답: `[ { "id": "string", "name": "string", ... } ]`

#### POST `/api/projects/{projectId}/chatrooms`
- 설명: 챗룸 생성
- 요청: `{ "name": "string" }`
- 응답: `{ "id": "string", ... }`

#### PATCH `/api/chatrooms/{id}`
- 설명: 챗룸 정보 수정
- 요청: `{ "name": "string" }`
- 응답: `{ "id": "string", ... }`

#### DELETE `/api/chatrooms/{id}`
- 설명: 챗룸 삭제
- 응답: `{ "success": true }`

---

### 4. 대화(Conversation) 관리
#### GET `/api/chatrooms/{chatroomId}/conversations`
- 설명: 대화 목록 조회
- 응답: `[ { "id": "string", "user_question": "string", ... } ]`

#### POST `/api/chatrooms/{chatroomId}/conversations`
- 설명: 대화 생성
- 요청: `{ "user_question": "string", "context": { ... } }`
- 응답: `{ "id": "string", ... }`

#### PATCH `/api/conversations/{id}`
- 설명: 대화 상태/내용 수정
- 요청: `{ "state": "string", ... }`
- 응답: `{ "id": "string", ... }`

#### DELETE `/api/conversations/{id}`
- 설명: 대화 삭제
- 응답: `{ "success": true }`

---

### 5. 코칭 API
#### POST `/api/coaching/pre`
- 설명: 프리코칭 실행
- 요청: `{ "question": "string", "context": { ... } }`
- 응답: `{ "result": "string", ... }`

#### POST `/api/ai/ask`
- 설명: AI 질문 실행
- 요청: `{ "question": "string", "context": { ... } }`
- 응답: `{ "answer": "string", ... }`

#### POST `/api/coaching/post`
- 설명: 포스트코칭 실행
- 요청: `{ "question": "string", "context": { ... } }`
- 응답: `{ "result": "string", ... }`

---

### 6. 메모리 관리
#### POST `/api/memory`
- 설명: 메모리 추가
- 요청: `{ "type": "global|project", "project_id": "string", "content": "string", ... }`
- 응답: `{ "id": "string", ... }`

#### GET `/api/memory`
- 설명: 메모리 조회
- 응답: `[ { "id": "string", "type": "string", ... } ]`

#### DELETE `/api/memory/{id}`
- 설명: 메모리 삭제
- 응답: `{ "success": true }`

---

## 에러 코드 예시
- 401 Unauthorized: 인증 실패
- 404 Not Found: 리소스 없음
- 400 Bad Request: 잘못된 요청
- 500 Internal Server Error: 서버 오류

---

## 참고
- 각 API의 상세 파라미터 및 예시는 실제 구현에 따라 추가/수정될 수 있습니다.