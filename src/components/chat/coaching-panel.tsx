import React, { useState, useEffect } from 'react';
import { useCoachingStore } from '@/lib/store/coaching-store';
import { useProjectStore } from '@/lib/store/project-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GlobeIcon, BookmarkIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

function RecommendationCard({ recommendation, isSelected, onSelect }: {
  recommendation: {
    id: string;
    question: string;
    reason: string;
    confidence: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'border-primary' : ''}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="font-medium">{recommendation.question}</p>
            <p className="text-sm text-muted-foreground mt-1">{recommendation.reason}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(recommendation.confidence * 100)}% confidence
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemoryAnalysisCard({ analysis }: { analysis: any }) {
  if (!analysis) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Analysis</CardTitle>
        <CardDescription>Analysis of relevant memories and context</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Key Memories</h4>
            <ul className="list-disc list-inside space-y-1">
              {analysis.keyMemories.map((memory: string, index: number) => (
                <li key={index} className="text-sm">{memory}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Relevance Score</h4>
            <div className="text-sm">{Math.round(analysis.relevanceScore * 100)}%</div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Context Match</h4>
            <div className="text-sm">{analysis.contextMatch ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatternAnalysisCard({ analysis }: { analysis: any }) {
  if (!analysis) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern Analysis</CardTitle>
        <CardDescription>Analysis of question patterns and applicability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Pattern Detected</h4>
            <div className="text-sm">{analysis.patternDetected ? 'Yes' : 'No'}</div>
          </div>
          {analysis.patternDetected && (
            <>
              <div>
                <h4 className="font-medium mb-2">Pattern Type</h4>
                <div className="text-sm">{analysis.patternType}</div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Example</h4>
                <div className="text-sm">{analysis.patternExample}</div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Applicability</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li className="text-sm">Global: {analysis.applicability.global ? 'Yes' : 'No'}</li>
                  <li className="text-sm">Project: {analysis.applicability.project ? 'Yes' : 'No'}</li>
                  <li className="text-sm">Room: {analysis.applicability.room ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </>
          )}
          <div>
            <h4 className="font-medium mb-2">Reason</h4>
            <div className="text-sm">{analysis.reason}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactAnalysisCard({ analysis }: { analysis: any }) {
  if (!analysis) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Analysis</CardTitle>
        <CardDescription>Analysis of memory impact and learning path</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Global Impact</h4>
            <div className="text-sm">
              <div>Impact: {Math.round(analysis.global.impactPercentage * 100)}%</div>
              <div className="mt-1">{analysis.global.impactDetails}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Project Impact</h4>
            <div className="text-sm">
              <div>Impact: {Math.round(analysis.project.impactPercentage * 100)}%</div>
              <div className="mt-1">{analysis.project.impactDetails}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Room Impact</h4>
            <div className="text-sm">
              <div>Impact: {Math.round(analysis.room.impactPercentage * 100)}%</div>
              <div className="mt-1">{analysis.room.impactDetails}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Overall Analysis</h4>
            <div className="text-sm">{analysis.overallAnalysis}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CoachingPanel({
  preCoachingResult,
  conversation,
}: CoachingPanelProps) {
  const {
    postCoaching,
    selectRecommendation,
  } = useCoachingStore();
  const { selectedConversation, selectedProject, updateConversation } = useProjectStore();
  const [editedQuestion, setEditedQuestion] = useState(conversation?.userQuestion || '');
  const [activeTab, setActiveTab] = useState('pre');
  const [isSaving, setIsSaving] = useState(false);
  const isAsked = conversation?.state === 'asked';
  const isNew = conversation?.state === 'new';

  const isGlobalSaved = !!selectedConversation?.savedToGlobal;
  const isProjectSaved = !!selectedConversation?.savedToProject;

  // 대화가 바뀌면 editedQuestion을 userQuestion으로 업데이트
  useEffect(() => {
    setEditedQuestion(conversation?.userQuestion || '');
    // 대화가 바뀌면 탭 상태도 업데이트
    if (conversation?.state === 'asked') {
      setActiveTab('post');
    } else {
      setActiveTab('pre');
    }
  }, [conversation]);

  // AI 응답에서 post-coaching 정보 추출
  const aiResponse = (() => {
    try {
      return conversation?.aiResponse ? JSON.parse(conversation.aiResponse) : null;
    } catch (e) {
      console.error('Error parsing AI response:', e);
      return null;
    }
  })();
  const postCoachingInfo = isAsked && aiResponse ? {
    keywords: aiResponse.keywords,
    summary: aiResponse.summary,
    followUpQuestions: aiResponse.follow_up_questions,
  } : null;

  const handleSaveToGlobalMemory = async () => {
    if (!postCoachingInfo?.summary || !selectedConversation) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/memories/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postCoachingInfo.summary }),
      });

      if (response.ok) {
        const updatedConversation = await updateConversation(selectedConversation.id, { savedToGlobal: true });
        // 인사이트맵 패널 갱신을 위해 이벤트 발생
        window.dispatchEvent(new Event('refreshMemories'));
        toast.success('전역 메모리에 저장되었습니다.');
      } else {
        throw new Error('Failed to save to global memory');
      }
    } catch (error) {
      console.error('Error saving to global memory:', error);
      toast.error('전역 메모리 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToProjectMemory = async () => {
    if (!postCoachingInfo?.summary || !selectedProject || !selectedConversation) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/memories/project/${selectedProject.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postCoachingInfo.summary }),
      });

      if (response.ok) {
        const updatedConversation = await updateConversation(selectedConversation.id, { savedToProject: true });
        // 인사이트맵 패널 갱신을 위해 이벤트 발생
        window.dispatchEvent(new Event('refreshMemories'));
        toast.success('프로젝트 메모리에 저장되었습니다.');
      } else {
        throw new Error('Failed to save to project memory');
      }
    } catch (error) {
      console.error('Error saving to project memory:', error);
      toast.error('프로젝트 메모리 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 bg-[var(--muted)] p-1 rounded-lg">
          <TabsTrigger
            value="pre"
            className="px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Pre-Coaching
          </TabsTrigger>
          <TabsTrigger
            value="post"
            disabled={!isAsked}
            className="px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post-Coaching
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pre" className="space-y-4">
          {isNew ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  질문을 입력하고 코칭을 요청하세요.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>질문 코칭 결과</CardTitle>
                <CardDescription>
                  AI가 분석한 질문의 핵심 정보와 개선 제안을 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold mb-1">핵심 키워드</div>
                      <div className="flex flex-wrap gap-2">
                        {preCoachingResult?.keywords?.map((keyword: string, i: number) => (
                          <Badge key={i} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">질문 요약</div>
                      <div className="text-sm text-muted-foreground">{preCoachingResult?.summary}</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Context 기반 보강 제안</div>
                      <div className="text-sm">
                        <div className="mb-2">
                          <b>필수:</b>
                          <ul className="list-disc list-inside text-muted-foreground mt-1">
                            {preCoachingResult?.context_suggestions?.required?.map((suggestion: string, i: number) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <b>선택:</b>
                          <ul className="list-disc list-inside text-muted-foreground mt-1">
                            {preCoachingResult?.context_suggestions?.optional?.map((suggestion: string, i: number) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">최적화 질문</div>
                      <div className="bg-[var(--muted)] rounded px-2 py-1 text-sm mb-2">
                        {preCoachingResult?.optimized_question}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mb-4 border-[var(--primary)] focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)]"
                        onClick={() => onConfirmQuestion(preCoachingResult?.optimized_question || '')}
                        disabled={isAsked}
                      >
                        최적화 질문으로 대화하기
                      </Button>
                      <Textarea
                        value={editedQuestion || preCoachingResult?.optimized_question || ''}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                        placeholder="질문을 수정할 수 있습니다"
                        className="mb-2"
                        readOnly={isAsked}
                      />
                      <Button
                        variant="outline"
                        className="w-full border-[var(--primary)] focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)]"
                        onClick={() => onConfirmQuestion(editedQuestion || preCoachingResult?.optimized_question || '')}
                        disabled={isAsked || !editedQuestion.trim()}
                      >
                        질문 수정 후 대화하기
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="post" className="space-y-4">
          {postCoachingInfo && (
            <Card>
              <CardHeader>
                <CardTitle>답변 분석</CardTitle>
                <CardDescription>
                  AI의 답변을 분석하고 기억할 내용을 저장하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold mb-1">핵심 키워드</div>
                      <div className="flex flex-wrap gap-2">
                        {postCoachingInfo.keywords?.map((keyword: string, i: number) => (
                          <Badge key={i} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">답변 요약</div>
                      <div className="text-sm text-muted-foreground">{postCoachingInfo.summary}</div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleSaveToGlobalMemory}
                          disabled={isSaving || isGlobalSaved}
                        >
                          <GlobeIcon className="w-4 h-4 mr-2" />
                          전역 메모리에 저장
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleSaveToProjectMemory}
                          disabled={isSaving || !selectedProject || isProjectSaved}
                        >
                          <BookmarkIcon className="w-4 h-4 mr-2" />
                          프로젝트 메모리에 저장
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">후속 질문</div>
                      <div className="space-y-2">
                        {postCoachingInfo.followUpQuestions?.map((question: string, i: number) => (
                          <div key={i} className="text-sm text-muted-foreground">{question}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}