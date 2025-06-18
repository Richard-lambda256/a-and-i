import { useEffect } from 'react';
import { useProjectStore } from './lib/store/project-store';
import { ProjectList } from './components/ProjectList';
import { ChatPanel } from './components/ChatPanel';
import { CoachingPanel } from './components/CoachingPanel';

function App() {
  const { initializeFromLastSession } = useProjectStore();

  useEffect(() => {
    initializeFromLastSession();
  }, [initializeFromLastSession]);

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <ProjectList />
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