# API Specification

## Overview
- **Base URL**: `/api`
- **Authentication**: API Key (encrypted in localStorage)
- **Content Type**: `application/json`

## Endpoints

### 1. API Key Management

#### Register/Update API Key
- **Endpoint**: `POST /api/key`
- **Description**: 사용자의 API 키를 등록하거나 업데이트합니다.
- **Request Body**:
  ```json
  {
    "key": "your-api-key"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "key": "encrypted-key",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

### 2. Project Management

#### Create Project
- **Endpoint**: `POST /api/projects`
- **Description**: 새로운 프로젝트를 생성합니다.
- **Request Body**:
  ```json
  {
    "name": "Project Name",
    "guideline": "Project Guideline"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "Project Name",
    "guideline": "Project Guideline",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Get Project
- **Endpoint**: `GET /api/projects/:id`
- **Description**: 특정 프로젝트의 정보를 조회합니다.
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "Project Name",
    "guideline": "Project Guideline",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Update Project
- **Endpoint**: `PUT /api/projects/:id`
- **Description**: 특정 프로젝트의 정보를 업데이트합니다.
- **Request Body**:
  ```json
  {
    "name": "Updated Project Name",
    "guideline": "Updated Project Guideline"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "Updated Project Name",
    "guideline": "Updated Project Guideline",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Delete Project
- **Endpoint**: `DELETE /api/projects/:id`
- **Description**: 특정 프로젝트를 삭제합니다.
- **Response**:
  ```json
  {
    "message": "Project deleted successfully"
  }
  ```

### 3. Chatroom Management

#### Create Chatroom
- **Endpoint**: `POST /api/projects/:projectId/chatrooms`
- **Description**: 특정 프로젝트 내에 새로운 채팅방을 생성합니다.
- **Request Body**:
  ```json
  {
    "name": "Chatroom Name"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "project_id": "project-uuid",
    "name": "Chatroom Name",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Get Chatroom
- **Endpoint**: `GET /api/chatrooms/:id`
- **Description**: 특정 채팅방의 정보를 조회합니다.
- **Response**:
  ```json
  {
    "id": "uuid",
    "project_id": "project-uuid",
    "name": "Chatroom Name",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Update Chatroom
- **Endpoint**: `PUT /api/chatrooms/:id`
- **Description**: 특정 채팅방의 정보를 업데이트합니다.
- **Request Body**:
  ```json
  {
    "name": "Updated Chatroom Name"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "project_id": "project-uuid",
    "name": "Updated Chatroom Name",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Delete Chatroom
- **Endpoint**: `DELETE /api/chatrooms/:id`
- **Description**: 특정 채팅방을 삭제합니다.
- **Response**:
  ```json
  {
    "message": "Chatroom deleted successfully"
  }
  ```

### 4. Conversation Management

#### Create Conversation
- **Endpoint**: `POST /api/chatrooms/:chatroomId/conversations`
- **Description**: 특정 채팅방 내에 새로운 대화를 생성합니다.
- **Request Body**:
  ```json
  {
    "userQuestion": "User Question"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "chatroomId": "chatroom-uuid",
    "userQuestion": "User Question",
    "usedQuestion": "User Question",
    "aiResponse": "",
    "preCoachingResult": null,
    "postCoachingResult": null,
    "state": "new",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
  ```

#### Get Conversation
- **Endpoint**: `GET /api/conversations/:id`
- **Description**: 특정 대화의 정보를 조회합니다.
- **Response**:
  ```json
  {
    "id": "uuid",
    "chatroomId": "chatroom-uuid",
    "userQuestion": "User Question",
    "usedQuestion": "Used Question",
    "aiResponse": "AI Response",
    "preCoachingResult": {},
    "postCoachingResult": {},
    "state": "asked",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
  ```

#### Update Conversation
- **Endpoint**: `PATCH /api/conversations/:id`
- **Description**: 특정 대화의 정보를 업데이트합니다.
- **Request Body**:
  ```json
  {
    "state": "preCoached",
    "usedQuestion": "Updated Question",
    "aiResponse": "AI Response",
    "preCoachingResult": {},
    "postCoachingResult": {}
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "chatroomId": "chatroom-uuid",
    "userQuestion": "User Question",
    "usedQuestion": "Updated Question",
    "aiResponse": "AI Response",
    "preCoachingResult": {},
    "postCoachingResult": {},
    "state": "preCoached",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
  ```

#### Delete Conversation
- **Endpoint**: `DELETE /api/conversations/:id`
- **Description**: 특정 대화를 삭제합니다.
- **Response**:
  ```json
  {
    "message": "Conversation deleted successfully"
  }
  ```

### 5. Coaching APIs

#### Pre-Coaching
- **Endpoint**: `POST /api/coaching/pre`
- **Description**: 사용자 질문에 대한 대화전 코칭을 수행합니다.
- **Request Body**:
  ```json
  {
    "question": "User Question",
    "context": {
      "globalMemories": [],
      "projectMemories": [],
      "chatHistory": []
    }
  }
  ```
- **Response**:
  ```json
  {
    "coaching_result": {
      "tags": ["keyword1", "keyword2"],
      "summary": "Question summary",
      "suggested_context": "Suggested context",
      "recommended_question": "Recommended question"
    }
  }
  ```

#### Post-Coaching
- **Endpoint**: `POST /api/coaching/post`
- **Description**: AI 응답에 대한 대화후 코칭을 수행합니다.
- **Request Body**:
  ```json
  {
    "question": "User Question",
    "response": "AI Response",
    "context": {
      "globalMemories": [],
      "projectMemories": [],
      "chatHistory": []
    }
  }
  ```
- **Response**:
  ```json
  {
    "coaching_result": {
      "analysis": "Response analysis",
      "suggestions": ["suggestion1", "suggestion2"],
      "next_steps": ["step1", "step2"]
    }
  }
  ```

#### 실제 질문 (AI Ask)
- **Endpoint**: `POST /api/ai/ask`
- **Description**: AI 질문 실행
- **Request Body**:
  ```json
  {
    "question": "User Question",
    "context": {
      "globalMemories": [],
      "projectMemories": [],
      "chatHistory": []
    }
  }
  ```
- **Response**:
  ```json
  {
    "answer": "AI Response"
  }
  ```

### UX Flow (2024-06 기준)
1. 사용자가 'Coaching' 버튼을 누르면 `/api/coaching/pre` 호출 → 추천 질문 표시
2. 사용자가 추천 질문을 선택하거나 직접 질문을 확정하면 `/api/ai/ask` 호출 → 답변 수신 후 `/api/coaching/post` 호출
3. 후코칭 결과를 패널에 표시

### 6. Memory Management

#### Add Memory
- **Endpoint**: `POST /api/memories`
- **Description**: 새로운 기억을 추가합니다.
- **Request Body**:
  ```json
  {
    "type": "GLOBAL",
    "project_id": "project-uuid",
    "keywords": ["keyword1", "keyword2"],
    "content": "Memory Content",
    "impact": 100
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "type": "GLOBAL",
    "project_id": "project-uuid",
    "keywords": ["keyword1", "keyword2"],
    "content": "Memory Content",
    "impact": 100,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### Query Memory
- **Endpoint**: `GET /api/memories`
- **Description**: 기억을 조회합니다.
- **Query Parameters**:
  - `type`: 기억 타입 (GLOBAL, PROJECT)
  - `project_id`: 프로젝트 ID (optional)
- **Response**:
  ```json
  [
    {
      "id": "uuid",
      "type": "GLOBAL",
      "project_id": "project-uuid",
      "keywords": ["keyword1", "keyword2"],
      "content": "Memory Content",
      "impact": 100,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
  ```

#### Delete Memory
- **Endpoint**: `DELETE /api/memories/:id`
- **Description**: 특정 기억을 삭제합니다.
- **Response**:
  ```json
  {
    "message": "Memory deleted successfully"
  }
  ```

## Notes
- 모든 API 요청은 API 키를 통해 인증됩니다.
- `context` 필드는 전역 기억, 프로젝트 기억, 대화 이력을 포함합니다.
- 각 API의 응답은 JSON 형식으로 반환됩니다.