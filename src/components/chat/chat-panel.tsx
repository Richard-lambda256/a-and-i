'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore, Project, Chatroom, Conversation } from '@/lib/store/project-store';
import { useCoachingStore } from '@/lib/store/coaching-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRightIcon, HomeIcon, PlusIcon } from '@radix-ui/react-icons';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

async function buildContext(
  selectedProjectId: string | null,
  selectedChatroomId: string | null,
  conversations: Conversation[],
  projects: Project[],
  chatrooms: Chatroom[]
) {
  try {
    // 전역 메모리 조회
    const globalMemoriesResponse = await fetch('/api/memories/global');
    const globalMemories = globalMemoriesResponse.ok ? await globalMemoriesResponse.json() : [];

    // 프로젝트 메모리 조회
    let projectMemories = [];
    if (selectedProjectId) {
      const projectMemoriesResponse = await fetch(`/api/memories/project/${selectedProjectId}`);
      projectMemories = projectMemoriesResponse.ok ? await projectMemoriesResponse.json() : [];
    }

    const project = selectedProjectId ? projects.find((p: Project) => p.id === selectedProjectId) : undefined;
    const projectGuidelines = project?.guideline || '';

    // 이전 대화 내역 조회
    const previousConversations = selectedChatroomId
      ? conversations.filter((c: Conversation) => c.chatroomId === selectedChatroomId)
      : [];

    return {
      globalMemories,
      projectMemories,
      projectGuidelines,
      previousConversations
    };
  } catch (error) {
    console.error('Error building context:', error);
    return {
      globalMemories: [],
      projectMemories: [],
      projectGuidelines: '',
      previousConversations: []
    };
  }
}

export function ChatPanel() {
  const {
    selectedProject,
    selectedChatroom,
    selectedConversation,
    updateConversation,
    setSelectedConversation,
    createConversation,
    apiKey,
  } = useProjectStore();

  const {
    setCoachingActive,
    setRecommendations,
    resetCoaching,
  } = useCoachingStore();

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCoaching, setShowCoaching] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      // Reset coaching state when conversation changes
      resetCoaching();
    }
  }, [selectedConversation, resetCoaching]);

  const handlePreCoaching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChatroom) return;
    // 방어 코드: projectId와 conversation이 반드시 있어야 함
    if (!selectedProject?.id || !selectedConversation) {
      alert('프로젝트 또는 대화가 선택되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }
    if (!apiKey) {
      alert('API Key가 없습니다. 먼저 API Key를 등록해 주세요.');
      return;
    }
    setIsLoading(true);
    try {
      // Pre-coaching만 호출
      const coachingResponse = await fetch('/api/coaching/pre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          question: message,
          projectId: selectedProject.id,
        }),
      });
      if (coachingResponse.ok) {
        const recommendations = await coachingResponse.json();
        setRecommendations(recommendations);
        setShowCoaching(true);
        setCoachingActive(true);
        // PATCH: 대화 상태를 preCoached로 변경
        if (selectedConversation) {
          const updated = await updateConversation(selectedConversation.id, {
            preCoachingResult: recommendations,
            state: 'preCoached',
            userQuestion: message,
          });
          setSelectedConversation(updated); // 최신 상태로 갱신
        }
      }
    } catch (error) {
      console.error('Pre-coaching error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!selectedChatroom) return;
    try {
      const newConversation = await createConversation(selectedChatroom.id, '');
      setSelectedConversation(newConversation);
      setMessage('');
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  // 대화 상태 분기
  const conversationState = selectedConversation?.state || 'new';
  const isAsked = conversationState === 'asked';
  const isPreCoached = conversationState === 'preCoached';
  const isNew = conversationState === 'new';

  // 입력창/버튼 상태
  const inputDisabled = isAsked;
  const coachingDisabled = isAsked;
  const inputReadonly = isAsked;

  // 질문/응답/코칭 결과 추출
  const userQuestion = selectedConversation ? selectedConversation.userQuestion : message;
  const aiAnswer = selectedConversation ? selectedConversation.aiResponse : '';
  // preCoachingResult는 useProjectStore에서 가져옴
  const { preCoachingResult } = useProjectStore();
  const usedQuestion = selectedConversation?.usedQuestion;

  const handleConfirmQuestion = async (question: string) => {
    if (!question.trim() || !selectedChatroom) return;
    if (!selectedProject?.id) {
      alert('프로젝트가 선택되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }
    if (!apiKey) {
      alert('API Key가 없습니다. 먼저 API Key를 등록해 주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          question,
          projectId: selectedProject.id,
          chatroomId: selectedChatroom.id,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const aiAnswer = await response.json();

      if (selectedConversation) {
        const updated = await updateConversation(selectedConversation.id, {
          state: 'asked',
          usedQuestion: question,
          aiResponse: JSON.stringify(aiAnswer),
          postCoachingResult: {
            keywords: aiAnswer.keywords,
            summary: aiAnswer.summary,
            followUpQuestions: aiAnswer.follow_up_questions
          }
        });
        setSelectedConversation(updated);
      }

      setMessage('');
      setShowCoaching(false);
      setCoachingActive(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {/* 상태별 안내/질문/응답/코칭 패널 */}
          {isNew && (
            <div className="text-center text-muted-foreground py-8">
              질문을 입력하고 코칭을 요청하세요.
            </div>
          )}
          {isPreCoached && (
            <div className="space-y-4">
              <div className="bg-[var(--muted)] rounded-lg px-4 py-2 text-[var(--foreground)] max-w-xl">
                <span className="font-semibold">{userQuestion}</span>
              </div>
              <div className="text-center text-muted-foreground py-4">
                Pre-Coaching 패널의 코칭 내용을 확인하고 AI에게 질문을 완료하세요.
              </div>
            </div>
          )}
          {isAsked && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground italic line-through">{userQuestion}</div>
              <div className="bg-[var(--muted)] rounded-lg px-4 py-2 text-[var(--foreground)] max-w-xl">
                <span className="font-semibold">{usedQuestion}</span>
              </div>
              {aiAnswer && (
                <div className="mt-4 bg-[var(--background)] rounded-lg px-4 py-2">
                  <ReactMarkdown>
                    {(() => {
                      try {
                        const parsed = typeof aiAnswer === 'string' ? JSON.parse(aiAnswer) : aiAnswer;
                        return parsed?.answer || '';
                      } catch (e) {
                        console.error('Error parsing AI answer:', e);
                        return '';
                      }
                    })()}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-[var(--border)] space-y-4">
        <form onSubmit={handlePreCoaching} className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={inputDisabled}
            readOnly={inputReadonly}
          />
          <Button type="submit" variant="outline" className="border-[var(--primary)]" disabled={coachingDisabled}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Coaching'}
          </Button>
        </form>
        {isAsked && (
          <Button
            onClick={handleNewChat}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-[var(--primary)]"
          >
            <PlusIcon className="w-4 h-4" />
            New Chat
          </Button>
        )}
      </div>
    </div>
  );
}