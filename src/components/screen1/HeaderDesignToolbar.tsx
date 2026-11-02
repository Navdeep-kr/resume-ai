import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import { TEMPLATES, TemplateDefinition } from '../../data/templates';
import { DesignControls } from '../screen2/DesignControls';
import { 
  Palette, Type, Layers, Eye, Download, 
  Sparkles, Check, ChevronDown, ZoomIn, ZoomOut, SplitSquareVertical,
  FileDown, FileText, Printer, Sliders, X, Upload, BookOpen, Zap, Maximize2
} from 'lucide-react';
import { exportToPdf, printResume } from '../../services/pdfExport';
import { exportToDocx } from '../../services/docxExport';
import { auditResumeForAts } from '../../services/atsAuditService';
import confetti from 'canvas-confetti';

interface HeaderDesignToolbarProps {
  resume: ResumeData;
  viewMode: 'split' | 'form';
  onViewModeChange: (mode: 'split' | 'form') => void;
  zoomScale: number;
  onZoomChange: (scale: number) => void;
  onChange: (updated: ResumeData) => void;
  onOpenImportModal?: () => void;
  onOpenAtsAudit?: () => void;
  onOpenBulletLibrary?: () => void;
  onOpenFullScreen?: () => void;
}

export const HeaderDesignToolbar: React.FC<HeaderDesignToolbarProps> = ({
  resume,
  viewMode,
  onViewModeChange,
  zoomScale,
  onZoomChange,
  onChange,
  onOpenImportModal,
  onOpenAtsAudit,
  onOpenBulletLibrary,
  onOpenFullScreen,
}) => {
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateFilter, setTemplateFilter] = useState('All');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMoreStylesDrawer, setShowMoreStylesDrawer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { design } = resume;
  const currentTemplate = TEMPLATES.find(t => t.id === design.templateId) || TEMPLATES[0];
  const atsReport = auditResumeForAts(resume);

  const COLOR_SWATCHES = [
    { name: 'Indigo Modern', color: '#4f46e5' },
    { name: 'Corporate Navy', color: '#0f172a' },
    { name: 'Royal Blue', color: '#2563eb' },
    { name: 'Nordic Teal', color: '#0d9488' },
    { name: 'Clinical Emerald', color: '#059669' },
    { name: 'Tech Cyan', color: '#0284c7' },
    { name: 'Creative Violet', color: '#7c3aed' },
    { name: 'Ruby Swiss', color: '#dc2626' },
    { name: 'Executive Wine', color: '#9d174d' },
    { name: 'Classic Bronze', color: '#78350f' },
    { name: 'Obsidian Black', color: '#18181b' },
  ];

  const FONT_OPTIONS = [
    { label: 'Inter (Clean Sans)', value: 'Inter' },
    { label: 'Roboto (Standard)', value: 'Roboto' },
    { label: 'Outfit (Modern Geometric)', value: 'Outfit' },
    { label: 'Montserrat (Executive)', value: 'Montserrat' },
    { label: 'Poppins (Friendly)', value: 'Poppins' },
    { label: 'Source Sans 3 (Minimal)', value: 'Source Sans 3' },
    { label: 'Merriweather (Classic Serif)', value: 'Merriweather' },
    { label: 'Lora (Editorial Serif)', value: 'Lora' },
    { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display' },
    { label: 'EB Garamond (Academic)', value: 'EB Garamond' },
    { label: 'Fira Code (Developer Code)', value: 'Fira Code' },
    { label: 'Space Grotesk (Modernist)', value: 'Space Grotesk' },
  ];

  const handleSelectTemplate = (template: TemplateDefinition) => {
    onChange({
      ...resume,
      design: {
        ...resume.design,
        templateId: template.id,
        colorScheme: {
          ...resume.design.colorScheme,
          ...(template.defaultSettings.colorScheme || {}),
        },
        typography: {
          ...resume.design.typography,
          ...(template.defaultSettings.typography || {}),
        },
        layout: {
          ...resume.design.layout,
          ...(template.defaultSettings.layout || {}),
        },
      },
      lastModified: Date.now(),
    });
    setShowTemplateDropdown(false);
  };

  const handleColorChange = (primaryColor: string) => {
    onChange({
      ...resume,
      design: {
        ...resume.design,
        colorScheme: {
          ...resume.design.colorScheme,
          primary: primaryColor,
        },
      },
      lastModified: Date.now(),
    });
  };

  const handleFontChange = (fontFamily: string) => {
    onChange({
      ...resume,
      design: {
        ...resume.design,
        typography: {
          ...resume.design.typography,
          fontFamily,
          nameFont: fontFamily,
          headingFont: fontFamily,
          bodyFont: fontFamily,
        },
      },
      lastModified: Date.now(),
    });
  };

  const handleLayoutToggle = (layoutType: 'single' | 'two-column') => {
    onChange({
      ...resume,
      design: {
        ...resume.design,
        layout: {
          ...resume.design.layout,
          layoutType,
        },
      },
      lastModified: Date.now(),
    });
  };

  const handleFitToOnePage = () => {
    onChange({
      ...resume,
      design: {
        ...resume.design,
        typography: {
          ...resume.design.typography,
          fontSize: 'small',
          lineSpacing: 'tight',
        },
        layout: {
          ...resume.design.layout,
          pagePadding: 'compact',
          sectionSpacing: 'compact',
        },
      },
      lastModified: Date.now(),
    });
  };

  // Quick Export
  const handleQuickDownloadPdf = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const fileName = `${(resume.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      await exportToPdf('resume-print-document', fileName, resume.design.pageSettings.pageSize);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      alert('PDF generation error. You can also use the print dialog.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickDownloadDocx = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await exportToDocx(resume);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      alert('DOCX generation error.');
    } finally {
      setIsExporting(false);
    }
  };

  const categories = ['All', 'Modern', 'Minimal', 'Executive', 'Classic', 'Technical', 'Creative', 'Two-column'];
  const filteredTemplates = templateFilter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category.toLowerCase() === templateFilter.toLowerCase());

  return (
    <>
      <div className="bg-white border-b border-slate-200 shadow-xs sticky top-16 z-20 w-full">
        <div className="w-full px-3 sm:px-6 lg:px-8 2xl:px-12 py-2 flex flex-wrap items-center justify-between gap-2.5">
          {/* LEFT: TEMPLATE, COLOR, FONT CONTROLS */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* TEMPLATE PICKER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 rounded-lg font-bold flex items-center gap-2 shadow-2xs transition"
                title="Change Template"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full border shadow-2xs flex-shrink-0"
                  style={{ backgroundColor: currentTemplate.thumbnailColor }}
                />
                <span className="hidden sm:inline text-slate-400 font-normal">Template:</span>
                <span className="max-w-[110px] sm:max-w-none truncate">{currentTemplate.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Template Dropdown / Popover */}
              {showTemplateDropdown && (
                <div className="absolute left-0 top-full mt-2 w-[340px] sm:w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 text-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Choose Template ({TEMPLATES.length} Styles)</span>
                    </div>
                    <button
                      onClick={() => setShowTemplateDropdown(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateFilter(cat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                          templateFilter === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Template Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {filteredTemplates.map(tpl => {
                      const isSelected = design.templateId === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div 
                              className="h-1.5 w-full rounded-full mb-1.5"
                              style={{ backgroundColor: tpl.thumbnailColor }}
                            />
                            <h5 className="font-bold text-[11px] text-slate-800 truncate">{tpl.name}</h5>
                            <span className="text-[9px] text-slate-400 font-medium block">{tpl.category}</span>
                          </div>
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* COLOR SWATCH SELECTOR */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2 py-1 rounded-lg">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-semibold hidden md:inline text-[11px]">Color:</span>
              <div className="flex items-center gap-1">
                {COLOR_SWATCHES.slice(0, 6).map((swatch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleColorChange(swatch.color)}
                    className={`w-4 h-4 rounded-full border transition transform hover:scale-110 ${
                      design.colorScheme.primary === swatch.color ? 'ring-2 ring-indigo-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: swatch.color, borderColor: '#cbd5e1' }}
                    title={swatch.name}
                  />
                ))}
                {/* Native Color Picker for custom color */}
                <div className="relative flex items-center pl-1 border-l border-slate-200">
                  <input
                    type="color"
                    value={design.colorScheme.primary}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                    title="Choose Custom Color"
                  />
                </div>
              </div>
            </div>

            {/* FONT SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 px-2 py-1 rounded-lg">
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={design.typography.fontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                className="bg-transparent text-slate-700 font-bold text-xs focus:outline-none cursor-pointer max-w-[100px] sm:max-w-[130px] truncate"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* QUICK LAYOUT TOGGLE (Single vs Two-Column) */}
            <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleLayoutToggle('single')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  design.layout.layoutType === 'single'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Single Column Layout"
              >
                1-Col
              </button>
              <button
                type="button"
                onClick={() => handleLayoutToggle('two-column')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  design.layout.layoutType === 'two-column' || design.layout.layoutType === 'sidebar-left'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Two Column (Sidebar) Layout"
              >
                2-Col
              </button>
            </div>

            {/* MORE STYLES DRAWER BUTTON */}
            <button
              type="button"
              onClick={() => setShowMoreStylesDrawer(true)}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition text-xs shadow-2xs"
              title="More Layout, Bullet & Heading Styles"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>More Styles</span>
            </button>

            {/* 1-CLICK FIT TO 1 PAGE */}
            <button
              type="button"
              onClick={handleFitToOnePage}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold flex items-center gap-1.5 transition text-xs shadow-2xs"
              title="1-Click Fit to 1 Page: Automatically tightens font size, line spacing and margins to keep your resume on a single page"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline">Fit to 1 Page</span>
            </button>

            {/* ACTION BULLETS LIBRARY */}
            {onOpenBulletLibrary && (
              <button
                type="button"
                onClick={onOpenBulletLibrary}
                className="px-2.5 py-1.5 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold flex items-center gap-1.5 transition text-xs shadow-2xs"
                title="Browse 100+ high-impact pre-written action bullets across Tech, Management, Finance, etc."
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Bullets Library</span>
              </button>
            )}

            {/* IMPORT FILE BUTTON */}
            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold flex items-center gap-1.5 transition text-xs shadow-2xs"
                title="Import Any File (PDF, Word, TXT, RTF, JSON)"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Import File</span>
              </button>
            )}
          </div>

          {/* RIGHT: REAL-TIME VIEW MODES & QUICK EXPORT */}
          <div className="flex items-center gap-2">
            {/* LIVE ATS SCORE & AUDIT BADGE */}
            {onOpenAtsAudit && (
              <button
                type="button"
                onClick={onOpenAtsAudit}
                className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition text-xs shadow-2xs ${
                  atsReport.score >= 80 
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    : atsReport.score >= 60
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                }`}
                title="Click to view ATS Score breakdown, power verbs detected, and resume improvements"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>ATS {atsReport.score}%</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 bg-white/90 rounded font-black shadow-2xs text-slate-800">
                  {atsReport.grade}
                </span>
              </button>
            )}
            {/* VIEW MODE TOGGLE (Split Real-Time View vs Form Only) */}
            <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onViewModeChange('split')}
                className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'split'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Real-time split view: Edit details on left, see live resume updating on right"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('form')}
                className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'form'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Form View: Full width form editing"
              >
                <span>Form Only</span>
              </button>
            </div>

            {/* FULL SIZE A4 VIEW BUTTON */}
            {onOpenFullScreen && (
              <button
                type="button"
                onClick={onOpenFullScreen}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition flex items-center gap-1.5 text-xs border border-slate-200 shadow-2xs"
                title="Open 100% Full-Size A4 Document Preview"
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Full Size A4</span>
              </button>
            )}

            {/* Quick Zoom for split view */}
            {viewMode === 'split' && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-1 rounded-lg text-[11px] text-slate-600">
                <button
                  type="button"
                  onClick={() => onZoomChange(Math.max(0.35, parseFloat((zoomScale - 0.05).toFixed(2))))}
                  className="p-0.5 hover:text-slate-900 transition"
                  title="Zoom Out (35% min)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold w-10 text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => onZoomChange(Math.min(1.3, parseFloat((zoomScale + 0.05).toFixed(2))))}
                  className="p-0.5 hover:text-slate-900 transition"
                  title="Zoom In (130% max)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* QUICK EXPORT DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={handleQuickDownloadPdf}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDownloadDocx}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 border-t border-slate-100"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download DOCX (Word)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      printResume();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 border-t border-slate-100"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print Document</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MORE STYLES SLIDE-OVER DRAWER */}
      {showMoreStylesDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Customize Layout & Styles
              </h3>
              <button
                type="button"
                onClick={() => setShowMoreStylesDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DesignControls resume={resume} onChange={onChange} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
