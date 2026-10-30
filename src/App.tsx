import React, { useState, useEffect } from 'react';
import { ResumeData } from './types/resume';
import { getActiveResume, saveResume } from './services/storageService';
import { Screen1UserDetails } from './components/screen1/Screen1UserDetails';

export const App: React.FC = () => {
  const [resume, setResume] = useState<ResumeData>(() => getActiveResume());

  // Auto-save to LocalStorage whenever resume changes
  useEffect(() => {
    saveResume(resume);
  }, [resume]);

  const handleResumeChange = (updated: ResumeData) => {
    setResume(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Screen1UserDetails
        resume={resume}
        onChange={handleResumeChange}
      />
    </div>
  );
};

export default App;
