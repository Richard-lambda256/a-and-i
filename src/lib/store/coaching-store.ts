import { create } from 'zustand';

export interface QuestionRecommendation {
  id: string;
  question: string;
  reason: string;
  confidence: number;
}

export interface MemoryAnalysis {
  keyMemories: string[];
  relevanceScore: number;
  contextMatch: boolean;
}

export interface PatternAnalysis {
  patternDetected: boolean;
  patternType: string;
  patternExample: string;
  applicability: {
    global: boolean;
    project: boolean;
    room: boolean;
  };
  reason: string;
}

export interface MemoryImpact {
  impactPercentage: number;
  keyMemories: string[];
  impactDetails: string;
}

export interface MemoryImpactAnalysis {
  global: MemoryImpact;
  project: MemoryImpact;
  room: MemoryImpact;
  overallAnalysis: string;
}

interface CoachingState {
  preCoaching: {
    recommendations: QuestionRecommendation[];
    selectedRecommendation: string | null;
  };
  postCoaching: {
    memoryAnalysis: MemoryAnalysis | null;
    patternAnalysis: PatternAnalysis | null;
    impactAnalysis: MemoryImpactAnalysis | null;
  };
  isCoachingActive: boolean;
  setRecommendations: (recommendations: QuestionRecommendation[]) => void;
  selectRecommendation: (id: string) => void;
  setMemoryAnalysis: (analysis: MemoryAnalysis) => void;
  setPatternAnalysis: (analysis: PatternAnalysis) => void;
  setImpactAnalysis: (analysis: MemoryImpactAnalysis) => void;
  setCoachingActive: (active: boolean) => void;
  resetCoaching: () => void;
}

export const useCoachingStore = create<CoachingState>((set) => ({
  preCoaching: {
    recommendations: [],
    selectedRecommendation: null,
  },
  postCoaching: {
    memoryAnalysis: null,
    patternAnalysis: null,
    impactAnalysis: null,
  },
  isCoachingActive: false,
  setRecommendations: (recommendations) =>
    set((state) => ({
      preCoaching: { ...state.preCoaching, recommendations },
    })),
  selectRecommendation: (id) =>
    set((state) => ({
      preCoaching: { ...state.preCoaching, selectedRecommendation: id },
    })),
  setMemoryAnalysis: (analysis) =>
    set((state) => ({
      postCoaching: { ...state.postCoaching, memoryAnalysis: analysis },
    })),
  setPatternAnalysis: (analysis) =>
    set((state) => ({
      postCoaching: { ...state.postCoaching, patternAnalysis: analysis },
    })),
  setImpactAnalysis: (analysis) =>
    set((state) => ({
      postCoaching: { ...state.postCoaching, impactAnalysis: analysis },
    })),
  setCoachingActive: (active) => set({ isCoachingActive: active }),
  resetCoaching: () =>
    set({
      preCoaching: {
        recommendations: [],
        selectedRecommendation: null,
      },
      postCoaching: {
        memoryAnalysis: null,
        patternAnalysis: null,
        impactAnalysis: null,
      },
      isCoachingActive: false,
    }),
}));