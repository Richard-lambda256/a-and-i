export type ConversationState = 'new' | 'preCoached' | 'asked';

export interface Conversation {
  id: string;
  chatroomId: string;
  userQuestion: string;
  usedQuestion: string;
  aiResponse: string;
  preCoachingResult?: unknown;
  postCoachingResult?: unknown;
  state: ConversationState;
  savedToGlobal: boolean;
  savedToProject: boolean;
  createdAt: string;
  updatedAt: string;
}