'use client';

import { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '@/lib/store/project-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { PlusIcon, ChevronRightIcon, ChevronDownIcon, HomeIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApiKeyStore } from '@/lib/store/api-key-store';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import type { Project } from '@/lib/store/project-store';

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

export default function ChatExplorer() {
  const { key } = useApiKeyStore();
  const initializeRef = useRef(false);
  const {
    projects,
    chatrooms,
    conversations,
    selectedProject,
    selectedChatroom,
    selectedConversation,
    setSelectedProject,
    setSelectedChatroom,
    setSelectedConversation,
    setProjects,
    setChatrooms,
    setConversations,
    fetchProjects,
    fetchChatrooms,
    fetchConversations,
    setApiKey: setProjectApiKey,
    apiKey: projectApiKey,
  } = useProjectStore();

  useEffect(() => {
    if (key && key !== projectApiKey) {
      setProjectApiKey(key);
    }
  }, [key, projectApiKey, setProjectApiKey]);

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedChatrooms, setExpandedChatrooms] = useState<Set<string>>(new Set());
  const [editProject, setEditProject] = useState<{id: string, name: string, guideline: string} | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectApiKey || initializeRef.current) return;
    initializeRef.current = true;

    const initialize = async () => {
      setLoading(true);
      try {
        // 1. 모든 프로젝트 가져오기
        const projectsData = await fetchProjects();
        if (projectsData.length === 0) {
          // 프로젝트가 없으면 새로 생성 (기존 로직 유지)
          const projectRes = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
            body: JSON.stringify({ name: '나의 첫 프로젝트', guideline: '' }),
          });
          const project = await projectRes.json();
          // 대화방 생성
          const chatroomRes = await fetch(`/api/projects/${project.id}/chatrooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
            body: JSON.stringify({ name: '일반 대화' }),
          });
          const chatroom = await chatroomRes.json();
          // 대화 생성
          const convRes = await fetch(`/api/chatrooms/${chatroom.id}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
            body: JSON.stringify({ userQuestion: '' }),
          });
          const conversation = await convRes.json();
          setProjects([project]);
          setChatrooms([chatroom]);
          setConversations([conversation]);
          setSelectedProject(project);
          setSelectedChatroom(chatroom);
          setSelectedConversation(conversation);
          setExpandedProjects(new Set([project.id]));
          localStorage.setItem('last_conversation_id', String(conversation.id || ''));
        } else {
          // 2. 모든 프로젝트에 대해 대화방, 모든 대화방에 대해 대화 가져오기 (병렬)
          setProjects(projectsData);
          const allChatrooms: any[] = [];
          const allConversations: any[] = [];
          await Promise.all(
            projectsData.map(async (project) => {
              const chatroomsRes = await fetch(`/api/projects/${project.id}/chatrooms`, {
                headers: { Authorization: `Bearer ${projectApiKey || ''}` },
              });
              const chatrooms = await chatroomsRes.json();
              allChatrooms.push(...chatrooms);
              await Promise.all(
                chatrooms.map(async (chatroom: any) => {
                  const conversationsRes = await fetch(`/api/chatrooms/${chatroom.id}/conversations`, {
                    headers: { Authorization: `Bearer ${projectApiKey || ''}` },
                  });
                  const conversations = await conversationsRes.json();
                  allConversations.push(...conversations);
                })
              );
            })
          );
          setChatrooms(allChatrooms);
          setConversations(allConversations);

          // 3. 선택/확장 상태 복원 (기존 로직 유지)
          const lastProjectId = localStorage.getItem('last_project_id');
          const firstProject = lastProjectId
            ? projectsData.find((p) => p.id === lastProjectId)
            : projectsData[0];
          if (firstProject) {
            setSelectedProject(firstProject);
            setExpandedProjects(new Set([firstProject.id]));
            const chatroomsData = allChatrooms.filter((c) => c.projectId === firstProject.id);
            if (chatroomsData.length > 0) {
              const lastChatroomId = localStorage.getItem('last_chatroom_id');
              const firstChatroom = lastChatroomId
                ? chatroomsData.find((c) => c.id === lastChatroomId)
                : chatroomsData[0];
              setSelectedChatroom(firstChatroom);
              setExpandedChatrooms(new Set([firstChatroom.id]));
              const conversationsData = allConversations.filter((c) => c.chatroomId === firstChatroom.id);
              if (conversationsData.length > 0) {
                const lastConvId = localStorage.getItem('last_conversation_id');
                const targetConv = lastConvId && conversationsData.find((c) => c.id === lastConvId);
                setSelectedConversation(targetConv || conversationsData[0]);
                localStorage.setItem('last_conversation_id', String(targetConv?.id || conversationsData[0].id || ''));
              } else {
                // 대화가 없으면 새로 생성
                const convRes = await fetch(`/api/chatrooms/${firstChatroom.id}/conversations`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
                  body: JSON.stringify({ userQuestion: '' }),
                });
                const conversation = await convRes.json();
                setConversations([...allConversations, conversation]);
                setSelectedConversation(conversation);
                localStorage.setItem('last_conversation_id', String(conversation.id || ''));
              }
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [projectApiKey]);

  useEffect(() => {
    // 선택된 대화가 있으면 해당 프로젝트/대화방을 expand
    if (selectedProject?.id) {
      setExpandedProjects(new Set([selectedProject.id]));
    }
    if (selectedChatroom?.id) {
      console.log('Chatroom changed:', selectedChatroom.id);
      setExpandedChatrooms(new Set([selectedChatroom.id]));
      // 대화방이 변경될 때마다 대화 목록을 새로 가져옴
      const loadConversations = async () => {
        console.log('Fetching conversations for chatroom:', selectedChatroom.id);
        const conversations = await fetchConversations(selectedChatroom.id);
        console.log('Fetched conversations:', conversations);
        if (conversations.length > 0) {
          const lastConvId = localStorage.getItem('last_conversation_id');
          console.log('Last conversation ID:', lastConvId);
          const targetConv = lastConvId ? conversations.find(c => c.id === lastConvId) : null;
          console.log('Selected conversation:', targetConv || conversations[0]);
          setSelectedConversation(targetConv || conversations[0]);
        }
      };
      loadConversations();
    }
  }, [selectedProject?.id, selectedChatroom?.id, fetchConversations, setSelectedConversation]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleAddProject = () => {
    setProjectName('');
    setOpen(true);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    try {
      // 1. 프로젝트 생성
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${projectApiKey || ''}`,
        },
        body: JSON.stringify({ name: projectName, guideline: '' }),
      });
      if (!res.ok) throw new Error('프로젝트 생성 실패');
      const project = await res.json();
      setProjects([...projects, project]);
      setSelectedProject(project);
      setExpandedProjects(new Set([project.id]));

      // 2. 채팅방 생성
      const chatroomRes = await fetch(`/api/projects/${project.id}/chatrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${projectApiKey || ''}`,
        },
        body: JSON.stringify({ name: '일반 대화' }),
      });
      if (!chatroomRes.ok) throw new Error('채팅방 생성 실패');
      const chatroom = await chatroomRes.json();
      setChatrooms([...chatrooms, chatroom]);
      setSelectedChatroom(chatroom);

      // 3. 대화 생성
      const convRes = await fetch(`/api/chatrooms/${chatroom.id}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${projectApiKey || ''}`,
        },
        body: JSON.stringify({ userQuestion: '' }),
      });
      if (!convRes.ok) throw new Error('대화 생성 실패');
      const conversation = await convRes.json();
      setConversations([...conversations, conversation]);
      setSelectedConversation(conversation);
      localStorage.setItem('last_conversation_id', String(conversation.id || ''));

      // 4. UI 상태 초기화
      setOpen(false);
      setProjectName('');
    } catch (error) {
      alert('프로젝트/채팅방/대화 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChatroom = async (projectId: string) => {
    const name = prompt('Enter chatroom name:');
    if (!name) return;
    setLoading(true);
    try {
      const chatroomRes = await fetch(`/api/projects/${projectId}/chatrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${projectApiKey || ''}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!chatroomRes.ok) throw new Error('채팅방 생성 실패');
      const chatroom = await chatroomRes.json();
      setChatrooms([...chatrooms, chatroom]);
      setSelectedChatroom(chatroom);
    } catch (error) {
      alert('채팅방 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    localStorage.setItem('last_conversation_id', String(conversation.id || ''));
  };

  const handleProjectMenu = (project: Project) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-6 h-6 text-[var(--primary)] hover:bg-[var(--primary)]/20">
          <DotsVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="rounded-xl bg-[var(--background)] border-[var(--border)] shadow-[0_0_4px_#00f6ff,0_0_8px_#00f6ff] px-2 py-1 text-sm">
        <DropdownMenuItem className="px-3 py-2 font-medium" onSelect={async () => {
          // 대화방 생성
          const chatroomRes = await fetch(`/api/projects/${project.id}/chatrooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
            body: JSON.stringify({ name: '일반 대화' }),
          });
          const chatroom = await chatroomRes.json();
          setChatrooms([...chatrooms, chatroom]);
          setSelectedChatroom(chatroom);
          // 대화 생성
          const convRes = await fetch(`/api/chatrooms/${chatroom.id}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
            body: JSON.stringify({ userQuestion: '' }),
          });
          const conversation = await convRes.json();
          setConversations([...conversations, conversation]);
          setSelectedConversation(conversation);
          localStorage.setItem('last_conversation_id', String(conversation.id || ''));
        }}>대화방 생성</DropdownMenuItem>
        <DropdownMenuItem className="px-3 py-2 font-medium" onSelect={() => setEditProject({id: project.id, name: project.name, guideline: project.guideline})}>프로젝트 수정</DropdownMenuItem>
        <DropdownMenuItem className="px-3 py-2 font-medium text-red-500" onSelect={() => setDeleteProjectId(project.id)}>프로젝트 삭제</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const idToString = (id: string | undefined) => (typeof id === 'string' ? id : '');

  if (loading) return <GameLoading />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center border-b border-[var(--border)] px-4 pb-2 rounded-xl bg-[var(--background)]/80">
        <h2 className="text-lg font-bold text-[var(--primary)] neon-glow text-center w-full rounded-xl bg-[var(--background)]/90 py-2 px-4 mb-2" style={{overflow: 'hidden'}}>
          EXPLORER
        </h2>
        <button
          className="mt-8 mb-2 px-4 py-1 rounded bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-neon hover:brightness-125 text-sm"
          onClick={handleAddProject}
        >
          + New Project
        </button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1 text-sm">
          {projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No projects found.</div>
          ) : (
            projects.map((project) => (
              <div key={project.id}>
                <div
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-[var(--muted)] ${selectedProject?.id === project.id ? 'bg-[var(--primary)]/10' : ''}`}
                  onClick={() => {
                    toggleProject(project.id);
                    setSelectedProject(project);
                  }}
                >
                  {expandedProjects.has(project.id) ? (
                    <ChevronDownIcon className="w-4 h-4 text-[var(--primary)]" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-[var(--primary)]" />
                  )}
                  <span className="flex-1 font-medium">{project.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                    asChild
                  >
                    {handleProjectMenu(project)}
                  </Button>
                </div>
                {expandedProjects.has(project.id) && (
                  <div className="ml-4 space-y-0.5">
                    {chatrooms.filter(c => c.projectId === project.id).map((chatroom) => (
                      <div key={chatroom.id}>
                        <div
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-[var(--muted)] ${selectedChatroom?.id === chatroom.id ? 'bg-[var(--primary)]/10' : ''}`}
                          onClick={() => {
                            setSelectedChatroom(chatroom);
                            setExpandedChatrooms((prev) => {
                              const next = new Set(prev);
                              if (next.has(chatroom.id)) {
                                next.delete(chatroom.id);
                              } else {
                                next.add(chatroom.id);
                              }
                              return next;
                            });
                          }}
                        >
                          {expandedChatrooms.has(chatroom.id) ? (
                            <ChevronDownIcon className="w-3 h-3 text-[var(--primary)]" />
                          ) : (
                            <ChevronRightIcon className="w-3 h-3 text-[var(--primary)]" />
                          )}
                          <span className="flex-1">{chatroom.name}</span>
                        </div>
                        {expandedChatrooms.has(chatroom.id) && (
                          <div className="mx-4 space-y-0.5">
                            {conversations.filter(c => c.chatroomId === chatroom.id).map((conversation) => (
                              <div
                                key={conversation.id}
                                className={`p-1.5 rounded cursor-pointer hover:bg-[var(--muted)] w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center ${selectedConversation?.id === conversation.id ? 'bg-[var(--primary)]/20 rounded font-bold text-[var(--primary)] shadow-neon' : ''}`}
                                onClick={async () => {
                                  console.log('Selecting conversation:', conversation.id);
                                  // 서버에서 최신 대화 상태를 가져옴
                                  const response = await fetch(`/api/conversations/${conversation.id}`, {
                                    headers: {
                                      'Authorization': `Bearer ${projectApiKey || ''}`,
                                    },
                                  });
                                  if (response.ok) {
                                    const updatedConversation = await response.json();
                                    console.log('Updated conversation from server:', updatedConversation);
                                    setSelectedConversation(updatedConversation);
                                    localStorage.setItem('last_conversation_id', String(updatedConversation.id));
                                  } else {
                                    console.error('Failed to fetch conversation:', response.status);
                                    setSelectedConversation(conversation);
                                    localStorage.setItem('last_conversation_id', String(conversation.id));
                                  }
                                }}
                              >
                                <span className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{conversation.userQuestion || '새 대화'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-full rounded-xl bg-[var(--background)] border-[var(--border)] shadow-neon">
          <DialogHeader>
            <DialogTitle className="text-[var(--primary)] font-bold text-xl neon-glow">새 프로젝트 생성</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="프로젝트 이름을 입력하세요"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="mt-4 mb-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)]"
            onKeyDown={e => { if (e.key === 'Enter') handleCreateProject(); }}
          />
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">취소</Button>
            <Button onClick={handleCreateProject} className="bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-neon hover:brightness-125">생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {editProject && (
        <Dialog open={!!editProject} onOpenChange={v => !v && setEditProject(null)}>
          <DialogContent className="max-w-sm w-full rounded-xl bg-[var(--background)] border-[var(--border)] shadow-neon">
            <DialogHeader>
              <DialogTitle className="text-[var(--primary)] font-bold text-xl neon-glow">프로젝트 수정</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              placeholder="프로젝트 이름"
              value={editProject.name}
              onChange={e => setEditProject({...editProject, name: e.target.value})}
              className="mt-4 mb-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] text-sm"
            />
            <textarea
              placeholder="지침(선택)"
              value={editProject.guideline}
              onChange={e => setEditProject({...editProject, guideline: e.target.value})}
              className="mb-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] text-xs rounded-xl px-3 py-2 resize-y min-h-[60px]"
            />
            <DialogFooter>
              <Button onClick={() => setEditProject(null)} variant="outline">취소</Button>
              <Button onClick={async () => {
                // PATCH API 호출
                await fetch(`/api/projects/${editProject.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${projectApiKey || ''}` },
                  body: JSON.stringify({ name: editProject.name, guideline: editProject.guideline }),
                });
                // 상태 반영
                setProjects(projects.map(p => p.id === editProject.id ? {...p, name: editProject.name, guideline: editProject.guideline} : p));
                setEditProject(null);
              }} className="bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-neon hover:brightness-125">저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {deleteProjectId && (
        <Dialog open={!!deleteProjectId} onOpenChange={v => !v && setDeleteProjectId(null)}>
          <DialogContent className="max-w-sm w-full rounded-xl bg-[var(--background)] border-[var(--border)] shadow-neon">
            <DialogHeader>
              <DialogTitle className="text-[var(--primary)] font-bold text-xl neon-glow">프로젝트 삭제</DialogTitle>
            </DialogHeader>
            <div className="mb-4">정말로 이 프로젝트를 삭제하시겠습니까?</div>
            <DialogFooter>
              <Button onClick={() => setDeleteProjectId(null)} variant="outline">취소</Button>
              <Button onClick={async () => {
                // DELETE API 호출
                await fetch(`/api/projects/${deleteProjectId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${projectApiKey || ''}` },
                });
                // 상태 반영
                setProjects(projects.filter(p => p.id !== deleteProjectId));
                setDeleteProjectId(null);
              }} className="bg-red-500 text-white font-bold shadow-neon hover:brightness-125">삭제</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}