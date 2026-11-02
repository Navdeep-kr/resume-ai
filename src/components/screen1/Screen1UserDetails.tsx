import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ResumeData, SectionKey } from '../../types/resume';
import { PersonalDetailsForm } from './PersonalDetailsForm';
import { SummaryForm } from './SummaryForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { AdditionalSectionsForm } from './AdditionalSectionsForm';
import { HeaderDesignToolbar } from './HeaderDesignToolbar';
import { ResumeDocument } from '../preview/ResumeDocument';
import { SAMPLE_PROFILES } from '../../data/sampleProfiles';
import { parseAnyResumeFile } from '../../services/resumeParser';
import { getAISettings, saveAISettings, AISettings, aiTailorToJobDescription, JobAnalysisResult } from '../../services/aiService';
import { exportToPdf, printResume } from '../../services/pdfExport';
import { exportToDocx } from '../../services/docxExport';
import confetti from 'canvas-confetti';
import { UniversalImportModal } from '../common/UniversalImportModal';
import { AtsAuditModal } from '../common/AtsAuditModal';
import { BulletLibraryModal } from '../common/BulletLibraryModal';
import { 
  User, FileText, Briefcase, GraduationCap, Code, PlusCircle, 
  ChevronDown, ChevronUp, Sparkles, Upload, CheckCircle2, 
  Settings, Bot, Target, Zap, Eye, Download, FileDown, Printer, FileUp,
  Maximize2, Sun, Moon, Loader2
} from 'lucide-react';

interface Screen1UserDetailsProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export const Screen1UserDetails: React.FC<Screen1UserDetailsProps> = ({
  resume,
  onChange,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    additional: false,
  });

  // Real-time View Mode: 'split' or 'form'
  const [viewMode, setViewMode] = useState<'split' | 'form'>('split');
  const [zoomScale, setZoomScale] = useState<number>(0.72);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isA4 = resume.design.pageSettings.pageSize === 'A4';
  const baseWidthPx = isA4 ? 794 : 816;
  const minHeightPx = isA4 ? 1123 : 1056;

  // Window resize listener
  useEffect(() => {
    const handleWinResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, []);

  // Auto-fit calculation based on preview container width
  const handleRecalculateAutoFit = useCallback(() => {
    if (!previewContainerRef.current) return;
    const containerWidth = previewContainerRef.current.clientWidth;
    if (containerWidth > 120) {
      const availableWidth = containerWidth - 28;
      const calculated = Math.min(1.25, Math.max(0.38, availableWidth / baseWidthPx));
      setZoomScale(parseFloat(calculated.toFixed(2)));
    }
  }, [baseWidthPx]);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (isAutoFit) {
        handleRecalculateAutoFit();
      }
    });
    observer.observe(previewContainerRef.current);
    if (isAutoFit) handleRecalculateAutoFit();
    return () => observer.disconnect();
  }, [isAutoFit, handleRecalculateAutoFit, viewMode]);

  const mobileScale = Math.min(0.65, Math.max(0.32, (windowWidth - 28) / baseWidthPx));

  const [showFullScreenPreview, setShowFullScreenPreview] = useState<boolean>(false);
  const [fullScreenZoom, setFullScreenZoom] = useState<number>(1.0);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [previewHeightMode, setPreviewHeightMode] = useState<'complete' | 'sticky'>('complete');
  const [docActualHeight, setDocActualHeight] = useState<number>(minHeightPx);

  // Measure actual rendered scroll height of document to avoid any content cutoff
  useEffect(() => {
    const updateActualHeight = () => {
      const el = document.getElementById('resume-preview-document');
      if (el && el.scrollHeight > 0) {
        setDocActualHeight(Math.max(minHeightPx, el.scrollHeight));
      }
    };
    updateActualHeight();
    const interval = setInterval(updateActualHeight, 500);
    return () => clearInterval(interval);
  }, [resume, minHeightPx]);

  const handleFitEntirePageHeight = () => {
    setIsAutoFit(false);
    const availableHeight = window.innerHeight - 240;
    const calculated = Math.min(1.0, Math.max(0.35, availableHeight / docActualHeight));
    setZoomScale(parseFloat(calculated.toFixed(2)));
  };

  // Keyboard shortcut: Esc to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFullScreenPreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [selectedSample, setSelectedSample] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [jobDescriptionInput, setJobDescriptionInput] = useState<string>('');
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResult | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState<boolean>(false);
  const [showBottomExportMenu, setShowBottomExportMenu] = useState<boolean>(false);
  const [showUniversalImportModal, setShowUniversalImportModal] = useState<boolean>(false);
  const [showAtsAuditModal, setShowAtsAuditModal] = useState<boolean>(false);
  const [showBulletLibraryModal, setShowBulletLibraryModal] = useState<boolean>(false);
  const [activeBulletTargetExpId, setActiveBulletTargetExpId] = useState<string | null>(null);

  // Mobile preview modal
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState<boolean>(false);

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>(getAISettings());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Profile pre-filling helper
  const handleLoadSample = (key: string) => {
    if (!key || !SAMPLE_PROFILES[key]) return;
    const sample = SAMPLE_PROFILES[key];
    onChange({
      ...resume,
      ...sample,
      personal: {
        ...resume.personal,
        ...(sample.personal || {}),
      },
      summary: {
        ...resume.summary,
        ...(sample.summary || {}),
      },
      experience: sample.experience || [],
      education: sample.education || [],
      skills: sample.skills || resume.skills,
      additional: sample.additional || resume.additional,
      lastModified: Date.now(),
    });
    setSelectedSample(key);
  };

  // Resume import helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: parsed } = await parseAnyResumeFile(file);
      handleApplyExtractedData(parsed);
      alert(`Successfully imported details from "${file.name}"!`);
    } catch (err) {
      console.error(err);
      alert('Could not parse this file automatically. You can enter or paste your details manually.');
    }
  };

  // Tailor to Job Description helper
  const handleAnalyzeJob = async () => {
    if (!jobDescriptionInput.trim()) return;
    setIsAnalyzingJob(true);
    try {
      const result = await aiTailorToJobDescription(resume, jobDescriptionInput);
      setJobAnalysis(result);
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  const handleApplyTailoredSummary = () => {
    if (!jobAnalysis?.tailoredSummary) return;
    onChange({
      ...resume,
      summary: {
        ...resume.summary,
        professionalSummary: jobAnalysis.tailoredSummary,
      },
    });
    setShowJobModal(false);
  };

  const handleApplyExtractedData = (extracted: Partial<ResumeData>) => {
    onChange({
      ...resume,
      ...extracted,
      personal: {
        ...resume.personal,
        ...(extracted.personal || {}),
      },
      summary: {
        ...resume.summary,
        ...(extracted.summary || {}),
      },
      experience: extracted.experience && extracted.experience.length > 0 ? extracted.experience : resume.experience,
      education: extracted.education && extracted.education.length > 0 ? extracted.education : resume.education,
      skills: extracted.skills || resume.skills,
      additional: {
        ...resume.additional,
        ...(extracted.additional || {}),
      },
      lastModified: Date.now(),
    });
  };

  const handleInsertBullet = (bullet: string) => {
    const formattedBullet = bullet.startsWith('•') ? bullet : `• ${bullet}`;
    if (activeBulletTargetExpId) {
      const updatedExp = (resume.experience || []).map(exp => {
        if (exp.id === activeBulletTargetExpId) {
          const current = (exp.achievements || '').trim();
          return {
            ...exp,
            achievements: current ? `${current}\n${formattedBullet}` : formattedBullet,
          };
        }
        return exp;
      });
      onChange({ ...resume, experience: updatedExp, lastModified: Date.now() });
    } else if (resume.experience && resume.experience.length > 0) {
      const updatedExp = resume.experience.map((exp, idx) => {
        if (idx === 0) {
          const current = (exp.achievements || '').trim();
          return {
            ...exp,
            achievements: current ? `${current}\n${formattedBullet}` : formattedBullet,
          };
        }
        return exp;
      });
      onChange({ ...resume, experience: updatedExp, lastModified: Date.now() });
    }
  };

  // Direct Downloads from Bottom Bar and Live Preview Header
  const handleDownloadPdf = async () => {
    setShowBottomExportMenu(false);
    setIsExportingPdf(true);
    try {
      const fileName = `${(resume.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      await exportToPdf('resume-print-document', fileName, resume.design.pageSettings.pageSize);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF generation encountered an issue. You can also click Print and choose "Save as PDF".');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setShowBottomExportMenu(false);
    await exportToDocx(resume);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  // Calculate completion percentage
  let score = 0;
  if (resume.personal.fullName) score += 20;
  if (resume.personal.email) score += 10;
  if (resume.personal.professionalTitle) score += 10;
  if (resume.summary.professionalSummary) score += 15;
  if (resume.experience && resume.experience.length > 0) score += 20;
  if (resume.education && resume.education.length > 0) score += 15;
  if (resume.skills.technical?.length || resume.skills.professional?.length) score += 10;

  return (
    <div className="min-h-screen bg-slate-100/60 pb-28 text-slate-800">
      {/* 1. TOP BRAND APP BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs w-full">
        <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-indigo-200 shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  RESUME AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Real-Time Editor
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                "Your experience. Your story. Your perfect resume."
              </p>
            </div>
          </div>

          {/* Quick Actions in Navbar */}
          <div className="flex items-center gap-2">
            {/* Quick Profile Pre-loader */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-semibold pl-1.5">Load Example:</span>
              <select
                value={selectedSample}
                onChange={(e) => handleLoadSample(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">Select profession...</option>
                <option value="software_engineer">Software Engineer</option>
                <option value="fresher_student">Fresher / Graduate (0 Exp)</option>
                <option value="medical_doctor">Physician / Doctor</option>
                <option value="teacher_education">Teacher / Educator</option>
                <option value="marketing_manager">Growth Marketing</option>
                <option value="executive_manager">Executive / COO</option>
              </select>
            </div>

            {/* Resume File Import Button */}
            <button
              type="button"
              onClick={() => setShowUniversalImportModal(true)}
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
              title="Upload existing resume (PDF, Word, TXT, JSON, or any document)"
            >
              <FileUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import Any File</span>
            </button>

            {/* AI Job Tailor Button */}
            <button
              type="button"
              onClick={() => setShowJobModal(true)}
              className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tailor to Job</span>
            </button>

            {/* AI Engine Settings */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs transition"
              title="Configure AI Engine (Gemini / OpenAI / Built-in)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile View Toggle */}
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="lg:hidden px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. REAL-TIME HEADER SECTION FOR TEMPLATES, COLORS, FONTS, AND LAYOUT */}
      <HeaderDesignToolbar
        resume={resume}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        zoomScale={zoomScale}
        onZoomChange={setZoomScale}
        onChange={onChange}
        onOpenImportModal={() => setShowUniversalImportModal(true)}
        onOpenAtsAudit={() => setShowAtsAuditModal(true)}
        onOpenBulletLibrary={() => {
          setActiveBulletTargetExpId(null);
          setShowBulletLibraryModal(true);
        }}
        onOpenFullScreen={() => setShowFullScreenPreview(true)}
      />

      {/* 3. MAIN WORKSPACE: SPLIT REAL-TIME OR FULL FORM */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-4 sm:pt-6">
        <div className={`grid gap-5 lg:gap-6 2xl:gap-8 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'max-w-5xl mx-auto'}`}>
          {/* LEFT COLUMN: EDITING DETAILS FORM */}
          <div className={`${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-6 2xl:col-span-5' : 'w-full'} space-y-5`}>
            {/* HERO BANNER & PROGRESS */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Real-Time Resume Editor
                </h1>
                <p className="text-xs text-slate-500">
                  Type your details below or pick styles above. Your live document updates instantaneously.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-48 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex flex-col gap-1 flex-shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Strength</span>
                  <span className="font-extrabold text-indigo-600">{score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* QUICK IMPORT BANNER CARD */}
            <div 
              onClick={() => setShowUniversalImportModal(true)}
              className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-200/90 hover:border-indigo-400 rounded-2xl cursor-pointer transition flex items-center justify-between gap-4 shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Import Details From Any File</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold">Auto-Fill</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload any PDF, Word (.docx), TXT, RTF, Markdown, or JSON document to extract and edit details immediately.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-white border border-indigo-200 group-hover:border-indigo-400 text-indigo-700 rounded-xl text-xs font-bold shadow-2xs transition flex-shrink-0"
              >
                Import File
              </button>
            </div>

            {/* SECTION A: PERSONAL DETAILS */}
            <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
              <div 
                onClick={() => toggleSection('personal')}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Section A: Personal Details & Contact
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Name, title, contact links, and optional photo.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resume.personal.fullName && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                  {openSections.personal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {openSections.personal && (
                <div className="p-4 sm:p-5">
                  <PersonalDetailsForm
                    personal={resume.personal}
                    onChange={(updated) => onChange({ ...resume, personal: updated, lastModified: Date.now() })}
                  />
                </div>
              )}
            </section>

            {/* SECTION B: PROFESSIONAL SUMMARY */}
            <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
              <div 
                onClick={() => toggleSection('summary')}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Section B: Professional Summary & Objective
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      AI writing assistant generates, improves, or quantifies your narrative.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resume.summary.professionalSummary && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Added
                    </span>
                  )}
                  {openSections.summary ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {openSections.summary && (
                <div className="p-4 sm:p-5">
                  <SummaryForm
                    summary={resume.summary}
                    targetRole={resume.personal.professionalTitle}
                    profession={resume.targetRole}
                    onChange={(updated) => onChange({ ...resume, summary: updated, lastModified: Date.now() })}
                  />
                </div>
              )}
            </section>

            {/* SECTION C: WORK EXPERIENCE */}
            <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
              <div 
                onClick={() => toggleSection('experience')}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>Section C: Work Experience</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {resume.experience?.length || 0} entries
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Roles, companies, dates, scope, and metric achievements.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {openSections.experience ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {openSections.experience && (
                <div className="p-4 sm:p-5">
                  <ExperienceForm
                    experience={resume.experience || []}
                    targetRole={resume.personal.professionalTitle}
                    onChange={(updated) => onChange({ ...resume, experience: updated, lastModified: Date.now() })}
                    onOpenBulletLibrary={(expId) => {
                      setActiveBulletTargetExpId(expId);
                      setShowBulletLibraryModal(true);
                    }}
                  />
                </div>
              )}
            </section>

            {/* SECTION D: EDUCATION */}
            <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
              <div 
                onClick={() => toggleSection('education')}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>Section D: Education</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {resume.education?.length || 0} entries
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Degrees, institutions, fields of study, and academic honors.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {openSections.education ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {openSections.education && (
                <div className="p-4 sm:p-5">
                  <EducationForm
                    education={resume.education || []}
                    onChange={(updated) => onChange({ ...resume, education: updated, lastModified: Date.now() })}
                  />
                </div>
              )}
            </section>

            {/* SECTION E: SKILLS */}
            <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
              <div 
                onClick={() => toggleSection('skills')}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Section E: Skills & Competencies
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Technical, professional, soft, and industry-specific skills.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {openSections.skills ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {openSections.skills && (
                <div className="p-4 sm:p-5">
                  <SkillsForm
                    skills={resume.skills}
                    targetRole={resume.personal.professionalTitle}
                    profession={resume.targetRole}
                    onChange={(updated) => onChange({ ...resume, skills: updated, lastModified: Date.now() })}
                  />
                </div>
              )}
            </section>

            {/* SECTION F: ADDITIONAL SECTIONS */}
            <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
              <div 
                onClick={() => toggleSection('additional')}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Section F: Additional Career Sections
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Projects, Certifications, Awards, Languages, and Licenses.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {openSections.additional ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {openSections.additional && (
                <div className="p-4 sm:p-5">
                  <AdditionalSectionsForm
                    additional={resume.additional}
                    sectionOrder={resume.sectionOrder}
                    hiddenSections={resume.hiddenSections}
                    onChange={(updated) => onChange({ ...resume, additional: updated, lastModified: Date.now() })}
                    onUpdateSectionOrder={(order) => onChange({ ...resume, sectionOrder: order, lastModified: Date.now() })}
                    onToggleSectionVisibility={(key) => {
                      const isHidden = resume.hiddenSections.includes(key);
                      const nextHidden = isHidden
                        ? resume.hiddenSections.filter(k => k !== key)
                        : [...resume.hiddenSections, key];
                      onChange({ ...resume, hiddenSections: nextHidden, lastModified: Date.now() });
                    }}
                  />
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: REAL-TIME PREVIEW (IN SPLIT VIEW) */}
          {viewMode === 'split' && (
            <div className="hidden lg:block lg:col-span-6 xl:col-span-6 2xl:col-span-7">
              <div 
                className={`rounded-3xl p-3 sm:p-4 border transition-all duration-200 flex flex-col items-center ${
                  previewHeightMode === 'sticky' 
                    ? 'sticky top-28 max-h-[calc(100vh-130px)] overflow-hidden' 
                    : 'h-auto overflow-visible'
                } ${
                  previewTheme === 'dark' 
                    ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' 
                    : 'bg-slate-200/85 border-slate-300/80 text-slate-800 shadow-xl'
                }`}
              >
                {/* Live Preview Header with Controls */}
                <div 
                  className={`w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b text-xs flex-shrink-0 ${
                    previewTheme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-300 text-slate-700'
                  }`}
                >
                  {/* Left: Document info & View mode toggle */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-extrabold tracking-tight">Live A4 Resume</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono border ${
                      previewTheme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200 shadow-2xs'
                    }`}>
                      {resume.design.pageSettings.pageSize}
                    </span>

                    {/* View Height Mode Toggle: Complete Long View vs Sticky Window */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] ml-1">
                      <button
                        type="button"
                        onClick={() => setPreviewHeightMode('complete')}
                        className={`px-2 py-0.5 rounded font-bold transition ${
                          previewHeightMode === 'complete' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Display full complete resume length with all details visible"
                      >
                        Complete Long View
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewHeightMode('sticky')}
                        className={`px-2 py-0.5 rounded font-bold transition ${
                          previewHeightMode === 'sticky' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Keep preview fixed in window with internal scroll"
                      >
                        Sticky Window
                      </button>
                    </div>
                  </div>

                  {/* Right Actions: PRINT, DOWNLOAD, ZOOM & FULL VIEW */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* PRIMARY ACTION: TAKE A PRINT OUT */}
                    <button
                      type="button"
                      onClick={() => printResume()}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-950 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95"
                      title="Print Resume or Save to PDF via Browser Print Dialog"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Print</span>
                    </button>

                    {/* PRIMARY ACTION: DOWNLOAD PDF */}
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95"
                      title="Download Clean High-Resolution PDF"
                    >
                      {isExportingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </>
                      )}
                    </button>

                    {/* DOWNLOAD DOCX */}
                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer hover:shadow-md active:scale-95"
                      title="Download Editable Word Document (.docx)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Word</span>
                    </button>

                    {/* Zoom & Scale Suite */}
                    <div className={`flex items-center gap-1 px-1 py-0.5 rounded-lg border text-xs ${
                      previewTheme === 'dark' ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-300/90 shadow-2xs'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoFit(false);
                          setZoomScale(prev => Math.max(0.35, parseFloat((prev - 0.05).toFixed(2))));
                        }}
                        className="px-1 text-slate-500 hover:text-slate-900 font-black text-sm leading-none"
                        title="Zoom Out"
                      >
                        −
                      </button>
                      <span className="font-mono font-bold text-[11px] w-9 text-center">
                        {Math.round(zoomScale * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoFit(false);
                          setZoomScale(prev => Math.min(1.3, parseFloat((prev + 0.05).toFixed(2))));
                        }}
                        className="px-1 text-slate-500 hover:text-slate-900 font-black text-sm leading-none"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoFit(false);
                          setZoomScale(1.0);
                        }}
                        className={`ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                          zoomScale === 1.0 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="View at 100% full physical size"
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        onClick={handleFitEntirePageHeight}
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold text-slate-500 hover:text-slate-900 transition"
                        title="Fit entire document height in view"
                      >
                        Fit Page
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoFit(true);
                          handleRecalculateAutoFit();
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                          isAutoFit ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Auto-Fit width to panel"
                      >
                        Auto
                      </button>
                    </div>

                    {/* Canvas Theme Toggle */}
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(prev => prev === 'light' ? 'dark' : 'light')}
                      className={`p-1.5 rounded-lg border transition ${
                        previewTheme === 'dark' 
                          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700' 
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 shadow-2xs'
                      }`}
                      title={previewTheme === 'light' ? 'Switch to Dark Canvas' : 'Switch to Light Desk Canvas'}
                    >
                      {previewTheme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    </button>

                    {/* Fullscreen View Button */}
                    <button
                      type="button"
                      onClick={() => setShowFullScreenPreview(true)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200 transition"
                      title="Open Fullscreen Document Viewer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scaled Preview Document */}
                <div 
                  ref={previewContainerRef}
                  className={`w-full flex justify-center items-start py-3 px-1 ${
                    previewHeightMode === 'sticky' ? 'flex-1 overflow-y-auto overflow-x-auto custom-scrollbar' : 'overflow-x-auto overflow-y-visible'
                  }`}
                >
                  <div
                    style={{
                      width: `${Math.round(baseWidthPx * zoomScale)}px`,
                      minHeight: `${Math.round(docActualHeight * zoomScale)}px`,
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: `${baseWidthPx}px`,
                        transform: `scale(${zoomScale})`,
                        transformOrigin: 'top left',
                      }}
                      className="shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10 rounded-xs bg-white"
                    >
                      <ResumeDocument 
                        resume={resume} 
                        scale={zoomScale} 
                        containerId="resume-preview-document" 
                        idPrefix="preview-" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-lg">
        <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">All changes saved automatically in private local draft.</span>
            <span className="sm:hidden">Auto-saved.</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBottomExportMenu(!showBottomExportMenu)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Resume</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showBottomExportMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition"
                >
                  <FileDown className="w-4 h-4 text-indigo-600" />
                  <span>Download PDF (A4/Letter)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Download DOCX (Word)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBottomExportMenu(false);
                    printResume();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition border-t border-slate-100"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Print Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE PREVIEW MODAL */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-slate-100 rounded-t-3xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 w-full border-t border-slate-300">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  A4 Resume Preview
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  {resume.design.pageSettings.pageSize}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePreviewModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-5 flex justify-center items-start bg-slate-200/80">
              <div
                style={{
                  width: `${Math.round(baseWidthPx * mobileScale)}px`,
                  minHeight: `${Math.round(minHeightPx * mobileScale)}px`,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: `${baseWidthPx}px`,
                    transform: `scale(${mobileScale})`,
                    transformOrigin: 'top left',
                  }}
                  className="shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10 rounded-xs bg-white"
                >
                  <ResumeDocument 
                    resume={resume} 
                    scale={mobileScale} 
                    containerId="resume-mobile-document" 
                    idPrefix="mobile-" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE A4 DOCUMENT VIEWER MODAL */}
      {showFullScreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col">
          {/* Top Fullscreen Control Bar */}
          <div className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                A4
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Full Size A4 Paper Document</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live 1:1 View
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  A4 Paper Dimensions (210 × 297 mm) • {resume.personal.fullName || 'Resume'}
                </p>
              </div>
            </div>

            {/* Center Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFullScreenZoom(prev => Math.max(0.4, parseFloat((prev - 0.1).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition font-black text-sm"
                title="Zoom Out"
              >
                −
              </button>
              <span className="font-mono font-bold w-12 text-center text-slate-800">
                {Math.round(fullScreenZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setFullScreenZoom(prev => Math.min(1.5, parseFloat((prev + 0.1).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition font-black text-sm"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setFullScreenZoom(1.0)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  fullScreenZoom === 1.0 ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                }`}
                title="View at exact 100% true A4 physical size"
              >
                100% (A4)
              </button>
              <button
                type="button"
                onClick={() => setFullScreenZoom(0.85)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  fullScreenZoom === 0.85 ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                }`}
                title="Fit to Page Height"
              >
                Fit Page
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Download Clean High-Resolution PDF"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => printResume()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Print Resume or Save to PDF via Browser Print Dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFullScreenPreview(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition font-bold text-sm"
                title="Exit Fullscreen (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Fullscreen Document Canvas (Clean Light Studio Desk) */}
          <div className="flex-1 overflow-auto bg-slate-200/80 p-6 sm:p-10 flex justify-center items-start custom-scrollbar">
            <div
              style={{
                width: `${Math.round(baseWidthPx * fullScreenZoom)}px`,
                minHeight: `${Math.round(minHeightPx * fullScreenZoom)}px`,
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: `${baseWidthPx}px`,
                  transform: `scale(${fullScreenZoom})`,
                  transformOrigin: 'top left',
                }}
                className="shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/10 rounded-xs bg-white"
              >
                <ResumeDocument 
                  resume={resume} 
                  scale={fullScreenZoom} 
                  containerId="resume-modal-document" 
                  idPrefix="modal-" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL IMPORT MODAL FOR ANY FILE TYPE */}
      <UniversalImportModal
        isOpen={showUniversalImportModal}
        onClose={() => setShowUniversalImportModal(false)}
        onApplyData={handleApplyExtractedData}
      />

      {/* ATS SCORE & QUALITY AUDIT REPORT MODAL */}
      <AtsAuditModal
        isOpen={showAtsAuditModal}
        onClose={() => setShowAtsAuditModal(false)}
        resume={resume}
      />

      {/* ACTION BULLETS LIBRARY MODAL */}
      <BulletLibraryModal
        isOpen={showBulletLibraryModal}
        onClose={() => setShowBulletLibraryModal(false)}
        onInsertBullet={handleInsertBullet}
      />

      {/* AI SETTINGS MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                AI Provider Settings
              </h3>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              RESUME AI includes a powerful built-in intelligent engine that works out-of-the-box without any API keys. You can also optionally connect your own Gemini or OpenAI API key.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  AI Engine
                </label>
                <select
                  value={aiSettings.provider}
                  onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="built-in">Built-in Intelligent Engine (Free, Offline, Ready)</option>
                  <option value="gemini">Google Gemini API (Gemini 1.5 Flash)</option>
                  <option value="openai">OpenAI API (GPT-4o / GPT-4o-mini)</option>
                </select>
              </div>

              {aiSettings.provider !== 'built-in' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={aiSettings.apiKey || ''}
                    onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                    placeholder="Enter your API key..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your key is stored strictly locally in your browser.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  saveAISettings(aiSettings);
                  setShowAiModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOB TAILOR MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-600" />
                Tailor Resume to Target Job
              </h3>
              <button 
                onClick={() => setShowJobModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste the job description of the role you're applying for. AI will analyze key requirements, compare with your experience, calculate match score, and suggest improvements.
            </p>

            <textarea
              rows={5}
              value={jobDescriptionInput}
              onChange={(e) => setJobDescriptionInput(e.target.value)}
              placeholder="Paste job posting here (e.g. responsibilities, requirements, qualifications)..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 leading-relaxed"
            />

            <button
              type="button"
              disabled={isAnalyzingJob || !jobDescriptionInput.trim()}
              onClick={handleAnalyzeJob}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isAnalyzingJob ? 'Analyzing Job Requirements...' : 'Analyze & Optimize Resume'}
            </button>

            {jobAnalysis && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Target Match Score:</span>
                  <span className="px-2.5 py-0.5 rounded-full font-extrabold text-xs bg-emerald-100 text-emerald-800">
                    {jobAnalysis.matchScore}% Match
                  </span>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase mb-1">Matching Keywords Found:</h4>
                  <div className="flex flex-wrap gap-1">
                    {jobAnalysis.matchingSkills.map((k, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </div>

                {jobAnalysis.missingSkills.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-600 uppercase mb-1">Keywords To Add (If Applicable):</h4>
                    <div className="flex flex-wrap gap-1">
                      {jobAnalysis.missingSkills.map((k, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase mb-1">Actionable Recommendations:</h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {jobAnalysis.actionableTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-violet-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleApplyTailoredSummary}
                    className="px-3.5 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition"
                  >
                    Apply Tailored Summary
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* DEDICATED PRINT & EXPORT DOCUMENT ROOT (Hidden on screen via .resume-print-only, active exclusively in native print and PDF export) */}
      <div id="resume-print-root" className="resume-print-only" aria-hidden="true">
        <ResumeDocument 
          resume={resume} 
          containerId="resume-print-document" 
          idPrefix="print-" 
        />
      </div>
    </div>
  );
};
