import React, { useState, useRef } from 'react';
import { ResumeData, SectionKey } from '../../types/resume';
import { PersonalDetailsForm } from './PersonalDetailsForm';
import { SummaryForm } from './SummaryForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { AdditionalSectionsForm } from './AdditionalSectionsForm';
import { SAMPLE_PROFILES } from '../../data/sampleProfiles';
import { parseResumeFile } from '../../services/resumeParser';
import { getAISettings, saveAISettings, AISettings, aiTailorToJobDescription, JobAnalysisResult } from '../../services/aiService';
import { 
  User, FileText, Briefcase, GraduationCap, Code, PlusCircle, 
  ChevronDown, ChevronUp, Sparkles, Upload, ArrowRight, CheckCircle2, 
  Settings, Bot, HelpCircle, FileCheck, Target, Zap
} from 'lucide-react';

interface Screen1UserDetailsProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onNavigateToScreen2: () => void;
}

export const Screen1UserDetails: React.FC<Screen1UserDetailsProps> = ({
  resume,
  onChange,
  onNavigateToScreen2,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    additional: false,
  });

  const [selectedSample, setSelectedSample] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [jobDescriptionInput, setJobDescriptionInput] = useState<string>('');
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResult | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState<boolean>(false);

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
      const parsed = await parseResumeFile(file);
      onChange({
        ...resume,
        ...parsed,
        personal: {
          ...resume.personal,
          ...(parsed.personal || {}),
        },
        summary: {
          ...resume.summary,
          ...(parsed.summary || {}),
        },
        experience: parsed.experience || resume.experience,
        education: parsed.education || resume.education,
        skills: parsed.skills || resume.skills,
        lastModified: Date.now(),
      });
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
    <div className="min-h-screen bg-slate-50/70 pb-28 text-slate-800">
      {/* SCREEN 1 TOP NAVIGATION / TOOLBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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
                  Screen 1 : Details
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                "Your experience. Your story. Your perfect resume."
              </p>
            </div>
          </div>

          {/* Quick Actions */}
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt,.json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
              title="Upload existing resume (PDF, DOCX, or text) to extract details"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Import Resume</span>
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

            {/* Direct Screen 2 Button */}
            <button
              type="button"
              onClick={onNavigateToScreen2}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-200 transition inline-flex items-center gap-1.5"
            >
              <span>Design & Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* HERO BANNER & PROGRESS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Professional Resume
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your details below. You can also import an existing resume or load sample profiles.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full md:w-56 bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Resume Strength</span>
              <span className="font-extrabold text-indigo-600">{score}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">
              {score >= 80 ? '✓ Ready for export!' : 'Fill in experience and education'}
            </span>
          </div>
        </div>

        {/* SECTION A: PERSONAL DETAILS */}
        <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
          <div 
            onClick={() => toggleSection('personal')}
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  Section A: Personal Details & Contact
                </h2>
                <p className="text-xs text-slate-500">
                  Name, professional title, contact links, and optional photo.
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
              {openSections.personal ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          {openSections.personal && (
            <div className="p-5">
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
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  Section B: Professional Summary & Objective
                </h2>
                <p className="text-xs text-slate-500">
                  AI writing assistant can generate or improve your career story.
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
              {openSections.summary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          {openSections.summary && (
            <div className="p-5">
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
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Section C: Work Experience</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {resume.experience?.length || 0} entries
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Roles, companies, dates, responsibilities, and quantified achievements.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {openSections.experience ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          {openSections.experience && (
            <div className="p-5">
              <ExperienceForm
                experience={resume.experience || []}
                targetRole={resume.personal.professionalTitle}
                onChange={(updated) => onChange({ ...resume, experience: updated, lastModified: Date.now() })}
              />
            </div>
          )}
        </section>

        {/* SECTION D: EDUCATION */}
        <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition">
          <div 
            onClick={() => toggleSection('education')}
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Section D: Education</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {resume.education?.length || 0} entries
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Degrees, institutions, fields of study, graduation years, and GPA.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {openSections.education ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          {openSections.education && (
            <div className="p-5">
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
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  Section E: Skills & Competencies
                </h2>
                <p className="text-xs text-slate-500">
                  Technical, professional, soft, and industry-specific skills.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {openSections.skills ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          {openSections.skills && (
            <div className="p-5">
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
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/50 transition border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  Section F: Additional Career Sections
                </h2>
                <p className="text-xs text-slate-500">
                  Projects, Certifications, Awards, Languages, and Licenses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {openSections.additional ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          {openSections.additional && (
            <div className="p-5">
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
      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">All changes saved automatically in private local draft.</span>
            <span className="sm:hidden">Auto-saved.</span>
          </div>

          <button
            type="button"
            onClick={onNavigateToScreen2}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>CREATE MY RESUME</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

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
    </div>
  );
};
