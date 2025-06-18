# Database Design

## Overview
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Schema**: 아래 정의된 테이블과 관계를 기반으로 Prisma 스키마로 변환

## Core Entities

### 1. Project
- **Description**: 사용자가 생성한 프로젝트. 각 프로젝트는 여러 채팅방을 포함할 수 있음.
- **Fields**:
  - `id`: UUID (PK)
  - `name`: String
  - `guideline`: String (nullable)
  - `created_at`: DateTime
  - `updated_at`: DateTime

### 2. Chatroom
- **Description**: 프로젝트 내의 채팅방. 각 채팅방은 여러 대화를 포함할 수 있음.
- **Fields**:
  - `id`: UUID (PK)
  - `project_id`: UUID (FK, references Project.id)
  - `name`: String
  - `created_at`: DateTime
  - `updated_at`: DateTime

### 3. Conversation
- **Description**: 채팅방 내의 대화. 각 대화는 사용자 질문, AI 응답, 코칭 결과를 포함.
- **Fields**:
  - `id`: UUID (PK)
  - `chatroom_id`: UUID (FK, references Chatroom.id)
  - `user_question`: String (사용자가 입력한 원본 질문)
  - `used_question`: String (pre-coaching 후 AI에 전달된 질문)
  - `ai_response`: String (AI의 응답)
  - `pre_coaching_result`: JSON (nullable, pre-coaching 결과)
  - `post_coaching_result`: JSON (nullable, post-coaching 결과)
  - `state`: Enum (new, preCoached, asked)
  - `created_at`: DateTime
  - `updated_at`: DateTime

### 4. Memory
- **Description**: 전역 또는 프로젝트 기억. 각 기억은 키워드, 내용, 영향도 등을 포함.
- **Fields**:
  - `id`: UUID (PK)
  - `type`: Enum (GLOBAL, PROJECT)
  - `project_id`: UUID (nullable, FK, references Project.id)
  - `keywords`: String[]
  - `content`: String
  - `impact`: Integer
  - `created_at`: DateTime
  - `updated_at`: DateTime

### 5. ApiKey
- **Description**: 사용자 API 키. 각 키는 사용자 식별자로 사용됨.
- **Fields**:
  - `id`: UUID (PK)
  - `key`: String (encrypted)
  - `created_at`: DateTime
  - `updated_at`: DateTime

## Relationships
- **Project** → **Chatroom**: One-to-Many
- **Chatroom** → **Conversation**: One-to-Many
- **Project** → **Memory**: One-to-Many (if type is PROJECT)
- **Project** → **ApiKey**: Many-to-One

## Indexes
- `Project`: `id`
- `Chatroom`: `id`, `project_id`
- `Conversation`: `id`, `chatroom_id`
- `Memory`: `id`, `project_id`
- `ApiKey`: `id`

## Constraints
- `Chatroom.project_id`: Foreign Key to Project.id
- `Conversation.chatroom_id`: Foreign Key to Chatroom.id
- `Memory.project_id`: Foreign Key to Project.id (if type is PROJECT)
- `Project.api_key_id`: Foreign Key to ApiKey.id

## Prisma Schema Example
```prisma
model Project {
  id         String     @id @default(uuid())
  name       String
  guideline  String?
  created_at DateTime   @default(now())
  updated_at DateTime   @updatedAt
  chatrooms  Chatroom[]
  memories   Memory[]
  apiKeyId   String
  apiKey     ApiKey     @relation(fields: [apiKeyId], references: [id])
}

model Chatroom {
  id           String         @id @default(uuid())
  project_id   String
  name         String
  created_at   DateTime       @default(now())
  updated_at   DateTime       @updatedAt
  project      Project        @relation(fields: [project_id], references: [id])
  conversations Conversation[]
}

model Conversation {
  id                    String   @id @default(uuid())
  chatroom_id           String
  user_question         String
  used_question         String
  ai_response           String
  pre_coaching_result   Json?
  post_coaching_result  Json?
  state                 String
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
  chatroom              Chatroom @relation(fields: [chatroom_id], references: [id])
}

model Memory {
  id         String   @id @default(uuid())
  type       String
  project_id String?
  keywords   String[]
  content    String
  impact     Int
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  project    Project? @relation(fields: [project_id], references: [id])
}

model ApiKey {
  id         String   @id @default(uuid())
  key        String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  projects   Project[]
}
```

## Notes
- 모든 테이블은 `created_at`, `updated_at` 필드를 포함하여 생성/수정 시간을 추적.
- `Memory` 테이블의 `type` 필드는 전역 또는 프로젝트 기억을 구분.
- `Conversation` 테이블의 `state` 필드는 대화 상태를 관리.
- `ApiKey` 테이블의 `key` 필드는 암호화하여 저장.
- `Conversation` 테이블은 하나의 Q&A 사이클을 하나의 레코드로 관리.