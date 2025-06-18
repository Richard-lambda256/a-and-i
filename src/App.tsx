import { useEffect } from 'react';
import { useProjectStore } from './lib/store/project-store';
import ChatExplorer from './components/explorer/chat-explorer';
import { ChatPanel } from './components/chat/chat-panel';
import { CoachingPanel } from './components/chat/coaching-panel';

function App() {
  const { initializeFromLastSession } = useProjectStore();

  useEffect(() => {
    initializeFromLastSession();
  }, [initializeFromLastSession]);

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <ChatExplorer />
      </div>
      <div className="flex-1 flex">
        <div className="flex-1">
          <ChatPanel />
        </div>
        <div className="w-96 border-l">
          <CoachingPanel />
        </div>
      </div>
    </div>
  );
}

export default App;