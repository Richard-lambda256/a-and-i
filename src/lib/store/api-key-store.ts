import { create } from 'zustand';

interface ApiKeyState {
  key: string | null;
  keyId: string | null;
  hasKey: boolean;
  setKey: (key: string | null, keyId: string | null) => void;
  fetchKey: () => Promise<void>;
  updateKey: (key: string) => Promise<boolean>;
}

export const useApiKeyStore = create<ApiKeyState>((set) => ({
  key: null,
  keyId: null,
  hasKey: false,
  setKey: (key, keyId) => {
    set({ key, keyId, hasKey: !!key && !!keyId });
    if (key) localStorage.setItem('ai_api_key', key);
    else localStorage.removeItem('ai_api_key');
  },
  fetchKey: async () => {
    const localKey = localStorage.getItem('ai_api_key');
    if (!localKey) {
      set({ key: null, keyId: null, hasKey: false });
      return;
    }
    const res = await fetch('/api/key', {
      headers: { Authorization: `Bearer ${localKey}` },
    });
    const data = await res.json();
    if (data?.id && data?.key) {
      set({ key: data.key, keyId: data.id, hasKey: true });
    } else {
      set({ key: null, keyId: null, hasKey: false });
      localStorage.removeItem('ai_api_key');
    }
  },
  updateKey: async (key) => {
    const res = await fetch('/api/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (res.ok && data?.id) {
      set({ key, keyId: data.id, hasKey: true });
      localStorage.setItem('ai_api_key', key);
      return true;
    }
    return false;
  },
}));