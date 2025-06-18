'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useApiKeyStore } from '@/lib/store/api-key-store';
import Link from 'next/link';
import { HomeIcon } from '@radix-ui/react-icons';
import { useProjectStore } from '@/lib/store/project-store';
import Image from 'next/image';
import { updateConversation } from '@/lib/api';

const ChatExplorer = dynamic(() => import('@/components/explorer/chat-explorer'));
const ChatPanel = dynamic(() => import('@/components/chat/chat-panel').then(mod => ({ default: mod.ChatPanel })));
const CoachingPanel = dynamic(() => import('@/components/chat/coaching-panel').then(mod => ({ default: mod.CoachingPanel })));
const InsightMapPanel = dynamic(() => import('@/components/chat/insight-map-panel').then(mod => ({ default: mod.InsightMapPanel })));

function GameLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sciFiBg to-sciFiBg/80 z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl font-bold text-[var(--primary)] neon-glow animate-pulse mb-2 rounded-xl bg-[var(--background)]/80 px-8 py-4 shadow-neon" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          LOADING...
        </div>
        <div className="w-64 h-4 bg-[var(--border)] rounded-full overflow-hidden shadow-lg">
          <div className="h-full bg-[var(--primary)] animate-sf-progress" style={{ width: '60%' }} />
        </div>
        <style jsx global>{`
          @keyframes sf-progress {
            0% { width: 0%; }
            40% { width: 60%; }
            60% { width: 80%; }
            80% { width: 90%; }
            100% { width: 100%; }
          }
          .animate-sf-progress {
            animation: sf-progress 1.8s cubic-bezier(0.4,0,0.2,1) infinite alternate;
          }
          .neon-glow {
            text-shadow: 0 0 8px var(--primary), 0 0 24px var(--primary);
          }
        `}</style>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { apiKey } = useProjectStore();
  const { fetchKey } = useApiKeyStore();
  const [loading, setLoading] = useState(true);

  const {
    selectedProject,
    selectedChatroom,
    selectedConversation,
    setSelectedConversation,
  } = useProjectStore();

  const breadcrumb: string[] = [];
  if (selectedProject) {
    breadcrumb.push(selectedProject.name);
    if (selectedChatroom) {
      breadcrumb.push(selectedChatroom.name);
      if (selectedConversation) {
        breadcrumb.push(selectedConversation.userQuestion || '새 대화');
      }
    }
  }

  useEffect(() => {
    fetchKey().finally(() => setLoading(false));
  }, [fetchKey]);

  useEffect(() => {
    if (!loading && !apiKey) {
      router.push('/ai/key');
    }
  }, [loading, apiKey, router]);

  const handleConfirmQuestion = async (question: string) => {
    if (!question.trim() || !selectedChatroom) return;
    if (!selectedProject?.id) {
      alert('프로젝트가 선택되지 않았습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }
    if (!apiKey) {
      alert('API Key가 필요합니다. API Key 관리 페이지에서 설정해주세요.');
      return;
    }
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
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <GameLoading />;
  if (!apiKey) return null;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center h-20 border-b border-[var(--border)] bg-[var(--background)]/95 px-6 gap-4">
        <div className="flex items-center justify-center w-64 h-full">
          <Image
            src="/logo.png"
            alt="A&I Logo"
            width={120}
            height={40}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="flex items-center gap-1 text-base text-[var(--muted-foreground)] select-none">
            <HomeIcon className="w-5 h-5 mr-1" />
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <span className="mx-2">/</span>}
                <span className={idx === breadcrumb.length - 1 ? 'font-bold text-[var(--primary)] neon-glow' : ''}>{item}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end w-[340px] h-full">
          <Link href="/ai/key">
            <button className="py-2 px-6 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-neon hover:brightness-125 text-sm">
              API Key 관리
            </button>
          </Link>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 h-full">
        <div className="w-[350px] border-r h-full flex flex-col">
          <ChatExplorer />
        </div>
        <div className="flex-[6] h-full">
          <ChatPanel />
        </div>
        <div className="flex-[4] flex flex-col border-l border-[var(--border)] bg-[var(--background)]/80 h-full overflow-auto">
          <CoachingPanel
            preCoachingResult={selectedConversation?.preCoachingResult}
            conversation={selectedConversation}
            onConfirmQuestion={handleConfirmQuestion}
          />
        </div>
      </div>
      <footer className="w-full border-t border-[var(--border)] bg-[var(--background)]/90 p-4">
        <InsightMapPanel />
      </footer>
    </div>
  );
}