import React, { useState, useRef } from 'react';
import { ResumeData } from '../../types/resume';
import { DesignControls } from './DesignControls';
import { ResumeDocument } from '../preview/ResumeDocument';
import { exportToDocx } from '../../services/docxExport';
import { exportToPdf, printResume } from '../../services/pdfExport';
import { 
  createNewResume, duplicateResume, deleteResume, getAllResumes, 
  saveResume, saveVersionSnapshot, getVersionSnapshots, VersionSnapshot 
} from '../../services/storageService';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Download, Printer, FileDown, Sliders, ZoomIn, ZoomOut, 
  RotateCcw, Sparkles, Copy, Trash2, Plus, Clock, Check, ChevronDown, 
  FileText, Eye, Share2, Layers, AlertCircle
} from 'lucide-react';

interface Screen2LiveEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onNavigateToScreen1: () => void;
}

export const Screen2LiveEditor: React.FC<Screen2LiveEditorProps> = ({
  resume,
  onChange,
  onNavigateToScreen1,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const [showDocManager, setShowDocManager] = useState<boolean>(false);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  // Trigger Confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Export PDF Handler
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const fileName = `${(resume.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      await exportToPdf('resume-preview-document', fileName, resume.design.pageSettings.pageSize);
      triggerConfetti();
      saveVersionSnapshot(resume, 'Exported PDF');
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. You can also use the "Print to PDF" option.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export DOCX Handler
  const handleDownloadDocx = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await exportToDocx(resume);
      triggerConfetti();
      saveVersionSnapshot(resume, 'Exported DOCX');
    } catch (err) {
      console.error(err);
      alert('Failed to generate DOCX file.');
    } finally {
      setIsExporting(false);
    }
  };

  // Native Print Handler
  const handlePrint = () => {
    setShowExportMenu(false);
    printResume();
  };

  // Document Management Handlers
  const handleNewResume = () => {
    const created = createNewResume('Untitled Resume');
    onChange(created);
    setShowDocManager(false);
  };

  const handleDuplicate = () => {
    const cloned = duplicateResume(resume.id);
    if (cloned) {
      onChange(cloned);
      alert('Resume duplicated successfully!');
      setShowDocManager(false);
    }
  };

  const handleDeleteCurrent = () => {
    if (confirm(`Are you sure you want to delete "${resume.title}"?`)) {
      const remaining = deleteResume(resume.id);
      onChange(remaining);
      setShowDocManager(false);
    }
  };

  const handleSwitchResume = (targetResume: ResumeData) => {
    onChange(targetResume);
    setShowDocManager(false);
  };

  const handleOpenVersions = () => {
    const list = getVersionSnapshots(resume.id);
    setVersions(list);
    setShowVersionHistory(true);
  };

  const handleRestoreVersion = (ver: VersionSnapshot) => {
    if (confirm(`Restore checkpoint from ${new Date(ver.timestamp).toLocaleTimeString()}?`)) {
      onChange(ver.resume);
      setShowVersionHistory(false);
    }
  };

  const allDocuments = getAllResumes();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-slate-800">
      {/* SCREEN 2 TOP APP BAR */}
      <header className="bg-slate-900 border-b border-slate-800 text-white h-16 px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToScreen1}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Details (Screen 1)</span>
            <span className="sm:hidden">Edit</span>
          </button>

          {/* Document Title Editable In-Place */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={resume.title}
              onChange={(e) => onChange({ ...resume, title: e.target.value, lastModified: Date.now() })}
              className="bg-transparent hover:bg-slate-800 focus:bg-slate-800 border-b border-transparent focus:border-indigo-500 text-white font-bold text-xs sm:text-sm px-2 py-1 rounded transition max-w-[140px] sm:max-w-[220px] truncate"
              title="Click to rename document"
            />
            <button
              type="button"
              onClick={() => setShowDocManager(true)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              title="Manage Resumes"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-lg text-xs text-slate-300">
          <button
            type="button"
            onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
            className="p-1 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-mono text-[11px] font-bold">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale(Math.min(1.3, zoomScale + 0.1))}
            className="p-1 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale(0.9)}
            className="p-1 text-slate-400 hover:text-white text-[10px] ml-1"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>

        {/* Right: Actions & Export */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            type="button"
            onClick={handleOpenVersions}
            className="hidden sm:inline-flex p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
            title="Version History & Restore Checkpoints"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileDrawer(true)}
            className="md:hidden px-3 py-1.5 bg-slate-800 text-indigo-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Design</span>
          </button>

          {/* Download Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Download Resume'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-slate-700">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-indigo-50 hover:text-indigo-700 font-semibold flex items-center gap-2.5 transition"
                >
                  <FileDown className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div>Download as PDF</div>
                    <div className="text-[10px] text-slate-400 font-normal">A4 / Letter ready for ATS & emailing</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-indigo-50 hover:text-indigo-700 font-semibold flex items-center gap-2.5 transition border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div>Download as DOCX</div>
                    <div className="text-[10px] text-slate-400 font-normal">Fully editable Microsoft Word format</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-indigo-50 hover:text-indigo-700 font-semibold flex items-center gap-2.5 transition border-t border-slate-100"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>Print / Save via Browser</div>
                    <div className="text-[10px] text-slate-400 font-normal">High-fidelity vector print dialog</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SCREEN 2 WORKSPACE: SPLIT DESKTOP LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: DESIGN & CUSTOMIZATION CONTROLS (DESKTOP) */}
        <aside className="hidden md:block w-96 flex-shrink-0 h-full overflow-hidden shadow-xl z-10">
          <DesignControls resume={resume} onChange={onChange} />
        </aside>

        {/* RIGHT PANEL: LIVE DOCUMENT PREVIEW CANVAS */}
        <main className="flex-1 bg-slate-900/95 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
          <div 
            className="transition-transform duration-150 origin-top"
            style={{
              transform: `scale(${zoomScale})`,
              marginBottom: `${zoomScale * 100}px`,
            }}
          >
            <ResumeDocument resume={resume} scale={zoomScale} />
          </div>
        </main>
      </div>

      {/* MOBILE DESIGN DRAWER */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end md:hidden">
          <div className="bg-white rounded-t-3xl max-h-[85vh] h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Customize Resume Design
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DesignControls resume={resume} onChange={onChange} />
            </div>
          </div>
        </div>
      )}

      {/* RESUME DOCUMENTS MANAGER MODAL */}
      {showDocManager && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Your Resumes ({allDocuments.length})
              </h3>
              <button 
                onClick={() => setShowDocManager(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSwitchResume(doc)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    doc.id === resume.id
                      ? 'border-indigo-600 bg-indigo-50/50 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{doc.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      Modified {new Date(doc.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  {doc.id === resume.id && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleNewResume}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Resume
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
              </div>

              {allDocuments.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                >
                  Delete Current
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Version History Checkpoints
              </h3>
              <button 
                onClick={() => setShowVersionHistory(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Checkpoints are created automatically when exporting or saving. Click any checkpoint to restore.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {versions.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No version snapshots yet. They will appear here when you save or export.
                </p>
              ) : (
                versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{ver.label}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ver.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
