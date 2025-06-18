// API 호출 함수들

/**
 * 대화 업데이트
 */
export const updateConversation = async (id: string, data: unknown) => {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update conversation');
  return response.json();
};