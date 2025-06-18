import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  guideline?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chatroom {
  id: string;
  name: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  chatroomId: string;
  userQuestion: string;
  usedQuestion: string;
  aiResponse: string;
  preCoachingResult?: unknown;
  postCoachingResult?: unknown;
  state: 'new' | 'preCoached' | 'asked';
  savedToGlobal: boolean;
  savedToProject: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  chatrooms: Chatroom[];
  conversations: Conversation[];
  selectedProject: Project | null;
  selectedChatroom: Chatroom | null;
  selectedConversation: Conversation | null;
  preCoachingResult: unknown | null;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  setPreCoachingResult: (result: unknown | null) => void;
  setProjects: (projects: Project[]) => void;
  setChatrooms: (chatrooms: Chatroom[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setSelectedChatroom: (chatroom: Chatroom | null) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  fetchProjects: () => Promise<Project[]>;
  fetchChatrooms: (projectId: string) => Promise<void>;
  fetchConversations: (chatroomId: string) => Promise<Conversation[]>;
  createConversation: (chatroomId: string, userQuestion: string) => Promise<Conversation>;
  updateConversation: (id: string, data: Partial<Conversation>) => Promise<Conversation>;
  initializeFromLastSession: () => Promise<void>;
  refreshMemories: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      chatrooms: [],
      conversations: [],
      selectedProject: null,
      selectedChatroom: null,
      selectedConversation: null,
      preCoachingResult: null,
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      setPreCoachingResult: (result) => set({ preCoachingResult: result }),
      setProjects: (projects) => set({ projects }),
      setChatrooms: (chatrooms) => set({ chatrooms }),
      setConversations: (conversations) => set({ conversations }),
      setSelectedProject: (project) => {
        set({ selectedProject: project });
        if (project) {
          localStorage.setItem('last_project_id', project.id);
        }
      },
      setSelectedChatroom: (chatroom) => {
        set({ selectedChatroom: chatroom });
        if (chatroom) {
          localStorage.setItem('last_chatroom_id', chatroom.id);
        }
      },
      setSelectedConversation: (conversation) => {
        set({ selectedConversation: conversation });
        if (conversation) {
          localStorage.setItem('last_conversation_id', conversation.id);
        }
      },
      fetchProjects: async () => {
        try {
          const { apiKey } = get();
          if (!apiKey) return [];

          const response = await fetch('/api/projects', {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch projects');
          const projects = await response.json();
          set({ projects });
          return projects;
        } catch (error) {
          console.error('Error fetching projects:', error);
          return [];
        }
      },
      fetchChatrooms: async (projectId) => {
        try {
          const { apiKey } = get();
          if (!apiKey) return;

          const response = await fetch(`/api/projects/${projectId}/chatrooms`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch chatrooms');
          const chatrooms = await response.json();
          set({ chatrooms });
        } catch (error) {
          console.error('Error fetching chatrooms:', error);
        }
      },
      fetchConversations: async (chatroomId) => {
        try {
          const { apiKey } = get();
          if (!apiKey) {
            console.log('No API key available');
            return [];
          }

          console.log('Fetching conversations from server for chatroom:', chatroomId);
          const response = await fetch(`/api/chatrooms/${chatroomId}/conversations`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          });
          if (!response.ok) {
            console.error('Failed to fetch conversations:', response.status);
            throw new Error('Failed to fetch conversations');
          }
          const conversations = await response.json();
          console.log('Received conversations from server:', conversations);
          set({ conversations });
          return conversations;
        } catch (error) {
          console.error('Error fetching conversations:', error);
          return [];
        }
      },
      createConversation: async (chatroomId, userQuestion) => {
        try {
          const { apiKey } = get();
          if (!apiKey) throw new Error('API Key is required');

          const response = await fetch(`/api/chatrooms/${chatroomId}/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ userQuestion }),
          });
          if (!response.ok) throw new Error('Failed to create conversation');
          const conversation = await response.json();
          set((state) => ({
            conversations: [...state.conversations, conversation],
          }));
          return conversation;
        } catch (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }
      },
      updateConversation: async (id, data) => {
        try {
          const { apiKey } = get();
          if (!apiKey) throw new Error('API Key is required');

          const response = await fetch(`/api/conversations/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to update conversation');
          const updatedConversation = await response.json();

          // conversations 배열과 selectedConversation 모두 업데이트
          set((state) => {
            const updatedConversations = state.conversations.map((c) =>
              c.id === id ? updatedConversation : c
            );
            return {
              conversations: updatedConversations,
              selectedConversation: state.selectedConversation?.id === id ? updatedConversation : state.selectedConversation,
            };
          });

          return updatedConversation;
        } catch (error) {
          console.error('Error updating conversation:', error);
          throw error;
        }
      },
      initializeFromLastSession: async () => {
        const { apiKey, fetchProjects, fetchChatrooms, fetchConversations } = get();
        if (!apiKey) return;

        // Fetch all projects
        const projects = await fetchProjects();
        if (projects.length === 0) return;

        // Try to restore last viewed project
        const lastProjectId = localStorage.getItem('last_project_id');
        const project = lastProjectId
          ? projects.find(p => p.id === lastProjectId)
          : projects[0];

        if (project) {
          set({ selectedProject: project });
          await fetchChatrooms(project.id);

          // Try to restore last viewed chatroom
          const lastChatroomId = localStorage.getItem('last_chatroom_id');
          const chatrooms = get().chatrooms;
          const chatroom = lastChatroomId
            ? chatrooms.find(c => c.id === lastChatroomId)
            : chatrooms[0];

          if (chatroom) {
            set({ selectedChatroom: chatroom });
            await fetchConversations(chatroom.id);

            // Try to restore last viewed conversation
            const lastConversationId = localStorage.getItem('last_conversation_id');
            const conversations = get().conversations;
            const conversation = lastConversationId
              ? conversations.find(c => c.id === lastConversationId)
              : conversations[conversations.length - 1];

            if (conversation) {
              set({ selectedConversation: conversation });
            } else if (chatroom) {
              // Create new conversation if none exists
              await get().createConversation(chatroom.id, '');
            }
          }
        }
      },
      refreshMemories: () => {
        // 이벤트를 발생시켜 메모리를 새로고침
        const event = new CustomEvent('refreshMemories');
        window.dispatchEvent(event);
      },
    }),
    {
      name: 'project-storage',
    }
  )
);