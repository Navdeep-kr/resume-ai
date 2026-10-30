import React, { useState, useRef } from 'react';
import { ResumeData } from '../../types/resume';
import { parseAnyResumeFile, extractResumeFromText, ExtractedResumeSummary } from '../../services/resumeParser';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, X, 
  Sparkles, FileCode, FileSpreadsheet, Image, ArrowRight, Clipboard 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UniversalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (extractedData: Partial<ResumeData>) => void;
}

export const UniversalImportModal: React.FC<UniversalImportModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    data: Partial<ResumeData>;
    summary: ExtractedResumeSummary;
  } | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage('');
    setFileName(file.name);
    try {
      const result = await parseAnyResumeFile(file);
      setParsedResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not extract structured data from this file. You can try pasting the text content directly.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handlePasteProcess = () => {
    if (!pasteText.trim()) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const data = extractResumeFromText(pasteText);
      const summary: ExtractedResumeSummary = {
        name: data.personal?.fullName || 'Extracted Profile',
        title: data.personal?.professionalTitle || '',
        email: data.personal?.email || '',
        phone: data.personal?.phone || '',
        location: data.personal?.location || '',
        experienceCount: data.experience?.length || 0,
        educationCount: data.education?.length || 0,
        skillsCount: (data.skills?.technical?.length || 0) + (data.skills?.professional?.length || 0),
        rawTextPreview: pasteText.slice(0, 300),
      };
      setParsedResult({ data, summary });
    } catch (err) {
      setErrorMessage('Failed to parse text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    onApplyData(parsedResult.data);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const resetState = () => {
    setParsedResult(null);
    setPasteText('');
    setFileName('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Import Details from Any File
              </h3>
              <p className="text-xs text-slate-500">
                Upload existing resumes or documents to directly populate your resume.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!parsedResult && (
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'paste' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Raw Text / Resume</span>
            </button>
          </div>
        )}

        {/* TAB 1: FILE UPLOADER & DRAG-AND-DROP */}
        {!parsedResult && activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file);
              }}
              accept=".pdf,.docx,.doc,.txt,.rtf,.md,.markdown,.json,.html,.htm,.csv"
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isProcessing ? 'Extracting Resume Details...' : 'Drag & drop ANY resume file here'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Supports <strong className="text-slate-700">PDF, Word (.docx / .doc), TXT, RTF, Markdown, HTML, JSON</strong>
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
              >
                Browse Files
              </button>
            </div>

            {/* Supported file badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.PDF</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.DOCX</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.TXT</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.RTF</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.MD</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.JSON</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">.HTML</span>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE TEXT */}
        {!parsedResult && activeTab === 'paste' && (
          <div className="space-y-3">
            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your resume text here (from LinkedIn, email, Word, or Google Docs)...&#10;&#10;e.g.&#10;John Doe&#10;Senior Software Engineer&#10;john.doe@email.com • (555) 123-4567&#10;&#10;Experience:&#10;Lead Developer at TechCorp (2020 - Present)..."
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={!pasteText.trim() || isProcessing}
                onClick={handlePasteProcess}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Extract Details</span>
              </button>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PARSED EXTRACTION RESULTS PREVIEW */}
        {parsedResult && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resume Details Successfully Extracted!</span>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs text-emerald-700 underline font-medium hover:text-emerald-900"
                >
                  Upload different file
                </button>
              </div>

              {/* Extracted Card Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Name</span>
                  <span className="font-extrabold text-slate-800 text-sm truncate block">
                    {parsedResult.summary.name}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Title</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {parsedResult.summary.title || 'Professional'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact</span>
                  <span className="text-slate-600 truncate block text-[11px]">
                    {parsedResult.summary.email || 'No email'} {parsedResult.summary.phone ? `• ${parsedResult.summary.phone}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sections Detected</span>
                  <span className="text-emerald-700 font-bold text-[11px]">
                    {parsedResult.summary.experienceCount} Jobs • {parsedResult.summary.educationCount} Degrees • {parsedResult.summary.skillsCount} Skills
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Clicking "Apply to Resume" will load these details directly into your editor so you can edit, customize templates/colors/fonts, and download or print immediately.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
              >
                <span>Apply to Resume & Start Editing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
