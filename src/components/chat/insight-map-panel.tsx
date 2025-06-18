'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '@/lib/store/project-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Memory {
  id: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  userQuestion: string;
  usedQuestion: string;
  createdAt: string;
}

export function InsightMapPanel() {
  const { selectedProject, selectedConversation, conversations } = useProjectStore();
  const [globalMemories, setGlobalMemories] = useState<Memory[]>([]);
  const [projectMemories, setProjectMemories] = useState<Memory[]>([]);
  const [previousConversations, setPreviousConversations] = useState<Conversation[]>([]);

  const fetchMemories = useCallback(async () => {
    try {
      // 전역 메모리 조회
      const globalResponse = await fetch('/api/memories/global');
      if (globalResponse.ok) {
        const data = await globalResponse.json();
        setGlobalMemories(data);
      }

      // 프로젝트 메모리 조회
      if (selectedProject) {
        const projectResponse = await fetch(`/api/memories/project/${selectedProject.id}`);
        if (projectResponse.ok) {
          const data = await projectResponse.json();
          setProjectMemories(data);
        }
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    }
  }, [selectedProject]);

  // 메모리 새로고침 이벤트 리스너
  useEffect(() => {
    const handleRefreshMemories = () => {
      fetchMemories();
    };

    window.addEventListener('refreshMemories', handleRefreshMemories);
    return () => {
      window.removeEventListener('refreshMemories', handleRefreshMemories);
    };
  }, [fetchMemories]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    if (selectedConversation) {
      // 현재 대화보다 이전에 생성된 대화들 필터링
      const previous = conversations
        .filter(c => c.createdAt < selectedConversation.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPreviousConversations(previous);
    }
  }, [selectedConversation, conversations]);

  return (
    <div className="grid grid-cols-4 gap-4 h-[300px]">
      {/* 전역 메모리 카드 */}
      <Card className="col-span-1">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">전역 메모리</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {globalMemories.map((memory) => (
                <TooltipProvider key={memory.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm p-2 bg-[var(--muted)] rounded truncate cursor-help">
                        {memory.content}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border rounded-md shadow-md">
                      <p className="max-w-[300px] p-2">{memory.content}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 프로젝트 메모리 카드 */}
      <Card className="col-span-1">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">프로젝트 메모리</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {projectMemories.map((memory) => (
                <TooltipProvider key={memory.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm p-2 bg-[var(--muted)] rounded truncate cursor-help">
                        {memory.content}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border rounded-md shadow-md">
                      <p className="max-w-[300px] p-2">{memory.content}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 프로젝트 지침 카드 */}
      <Card className="col-span-1">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">프로젝트 지침</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-[200px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm p-2 bg-[var(--muted)] rounded truncate cursor-help">
                    {selectedProject?.guideline || '지침이 없습니다.'}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border rounded-md shadow-md">
                  <p className="max-w-[300px] p-2">{selectedProject?.guideline || '지침이 없습니다.'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 이전 대화 카드 */}
      <Card className="col-span-1">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">이전 대화</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {previousConversations.map((conversation) => (
                <TooltipProvider key={conversation.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm p-2 bg-[var(--muted)] rounded cursor-help">
                        <div className="truncate">Q: {conversation.usedQuestion}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(conversation.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border rounded-md shadow-md">
                      <p className="max-w-[300px] p-2">Q: {conversation.usedQuestion}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}