'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiKeyStore } from '@/lib/store/api-key-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function APIKeyPage() {
  const router = useRouter();
  const { key, setKey, fetchKey, updateKey } = useApiKeyStore();
  const [inputKey, setInputKey] = useState(key || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  useEffect(() => {
    setInputKey(key || '');
  }, [key]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!key) { // ACTIVATE: localStorage에 key가 없는 경우
      // 1. 입력한 키로 먼저 GET 조회
      const res = await fetch('/api/key', {
        headers: { Authorization: `Bearer ${inputKey}` },
      });
      const data = await res.json();
      if (data?.id && data?.key) {
        setKey(inputKey, data.id); // 이미 존재하는 키 사용
        setLoading(false);
        router.push('/ai/chat');
        return;
      }
      // 2. 없으면 POST로 생성
      const postRes = await fetch('/api/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputKey }),
      });
      const postData = await postRes.json();
      if (postRes.ok && postData?.id) {
        setKey(inputKey, postData.id);
        setLoading(false);
        router.push('/ai/chat');
        return;
      } else {
        setError('API Key 저장에 실패했습니다.');
        setLoading(false);
        return;
      }
    } else { // UPDATE KEY
      const ok = await updateKey(inputKey);
      setLoading(false);
      if (ok) {
        router.push('/ai/chat');
      } else {
        setError('API Key 저장에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sciFiBg to-sciFiBg/80">
      <Card className="w-full max-w-md p-8 border-[var(--primary)]">
        <h1 className="text-2xl font-bold mb-6 text-[var(--primary)] neon-glow">
          COACH CONFIGURATION
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-[var(--muted-foreground)]">
              GEMINI API KEY
            </label>
            <Input
              id="apiKey"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)]"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button
            type="submit"
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-[Orbitron] shadow-neon border border-[var(--primary)] hover:brightness-125"
            disabled={loading}
          >
            {loading ? '저장 중...' : key ? 'UPDATE KEY' : 'ACTIVATE'}
          </Button>
        </form>
      </Card>
    </div>
  );
}