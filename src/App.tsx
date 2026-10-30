import React, { useState, useEffect } from 'react';
import { ResumeData } from './types/resume';
import { getActiveResume, saveResume, saveVersionSnapshot } from './services/storageService';
import { Screen1UserDetails } from './components/screen1/Screen1UserDetails';
import { Screen2LiveEditor } from './components/screen2/Screen2LiveEditor';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'screen1' | 'screen2'>('screen1');
  const [resume, setResume] = useState<ResumeData>(() => getActiveResume());

  // Auto-save to LocalStorage whenever resume changes
  useEffect(() => {
    saveResume(resume);
  }, [resume]);

  // Handler for updating resume
  const handleResumeChange = (updated: ResumeData) => {
    setResume(updated);
  };

  const handleNavigateToScreen2 = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    saveVersionSnapshot(resume, 'Navigated to Live Editor');
    setActiveScreen('screen2');
  };

  const handleNavigateToScreen1 = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveScreen('screen1');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {activeScreen === 'screen1' ? (
        <Screen1UserDetails
          resume={resume}
          onChange={handleResumeChange}
          onNavigateToScreen2={handleNavigateToScreen2}
        />
      ) : (
        <Screen2LiveEditor
          resume={resume}
          onChange={handleResumeChange}
          onNavigateToScreen1={handleNavigateToScreen1}
        />
      )}
    </div>
  );
};

export default App;
