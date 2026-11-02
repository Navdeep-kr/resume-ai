import React, { useState } from 'react';
import { ResumeData, DesignSettings, SectionKey } from '../../types/resume';
import { TEMPLATES } from '../../data/templates';
import { 
  Palette, Type, Layout, FileText, Check, Eye, EyeOff, 
  ArrowUp, ArrowDown, Sliders, Sparkles, Layers, SlidersHorizontal 
} from 'lucide-react';

interface DesignControlsProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export const DesignControls: React.FC<DesignControlsProps> = ({
  resume,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'colors' | 'typography' | 'layout' | 'sections'>('templates');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('All');

  const { design, sectionOrder, hiddenSections } = resume;
  const { colorScheme, typography, layout, pageSettings, templateId } = design;

  const updateDesign = (updatedPartial: Partial<DesignSettings>) => {
    onChange({
      ...resume,
      design: {
        ...resume.design,
        ...updatedPartial,
      },
      lastModified: Date.now(),
    });
  };

  const handleSelectTemplate = (tId: string) => {
    const tDef = TEMPLATES.find(t => t.id === tId);
    if (!tDef) return;

    onChange({
      ...resume,
      design: {
        ...resume.design,
        templateId: tId,
        colorScheme: {
          ...resume.design.colorScheme,
          ...(tDef.defaultSettings.colorScheme || {}),
        },
        typography: {
          ...resume.design.typography,
          ...(tDef.defaultSettings.typography || {}),
        },
        layout: {
          ...resume.design.layout,
          ...(tDef.defaultSettings.layout || {}),
        },
      },
      lastModified: Date.now(),
    });
  };

  // Preset Colors
  const COLOR_PRESETS = [
    { name: 'Indigo Modern', primary: '#4f46e5', headings: '#1e293b', sidebar: '#f8fafc' },
    { name: 'Corporate Navy', primary: '#0f172a', headings: '#0f172a', sidebar: '#f1f5f9' },
    { name: 'Emerald Clinical', primary: '#059669', headings: '#064e3b', sidebar: '#f0fdf4' },
    { name: 'Royal Blue', primary: '#2563eb', headings: '#1e3a8a', sidebar: '#eff6ff' },
    { name: 'Tech Cyan', primary: '#0284c7', headings: '#0f172a', sidebar: '#f0f9ff' },
    { name: 'Nordic Teal', primary: '#0d9488', headings: '#134e4a', sidebar: '#f0fdfa' },
    { name: 'Crimson Swiss', primary: '#dc2626', headings: '#000000', sidebar: '#fef2f2' },
    { name: 'Violet Creative', primary: '#7c3aed', headings: '#2e1065', sidebar: '#faf5ff' },
    { name: 'Executive Burgundy', primary: '#9d174d', headings: '#700732', sidebar: '#fff1f2' },
    { name: 'Classic Bronze', primary: '#78350f', headings: '#451a03', sidebar: '#fafaf9' },
    { name: 'Obsidian Minimal', primary: '#18181b', headings: '#09090b', sidebar: '#f4f4f5' },
  ];

  // Font Options
  const FONT_OPTIONS = [
    { label: 'Inter (Modern Sans)', value: 'Inter' },
    { label: 'Roboto (Clean & Neutral)', value: 'Roboto' },
    { label: 'Outfit (Geometric Clean)', value: 'Outfit' },
    { label: 'Montserrat (Executive)', value: 'Montserrat' },
    { label: 'Poppins (Friendly & Punchy)', value: 'Poppins' },
    { label: 'Source Sans 3 (Minimalist)', value: 'Source Sans 3' },
    { label: 'Merriweather (Classic Serif)', value: 'Merriweather' },
    { label: 'Lora (Editorial Serif)', value: 'Lora' },
    { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display' },
    { label: 'EB Garamond (Academic)', value: 'EB Garamond' },
    { label: 'Fira Code (Tech / Code)', value: 'Fira Code' },
    { label: 'Space Grotesk (Modernist)', value: 'Space Grotesk' },
  ];

  // Template categories for filter tabs
  const categories = ['All', 'Modern', 'Minimal', 'Executive', 'Classic', 'Technical', 'Creative', 'Two-column', 'Academic'];
  const filteredTemplates = templateCategoryFilter === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category.toLowerCase() === templateCategoryFilter.toLowerCase());

  // Section labels
  const sectionLabelMap: Record<string, string> = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills & Competencies',
    projects: 'Projects',
    certifications: 'Certifications',
    awards: 'Honors & Awards',
    internships: 'Internships',
    publications: 'Publications',
    languages: 'Languages',
    licenses: 'Licenses & Credentials',
  };

  const handleToggleSection = (key: SectionKey) => {
    const isHidden = hiddenSections.includes(key);
    const nextHidden = isHidden
      ? hiddenSections.filter(k => k !== key)
      : [...hiddenSections, key];
    onChange({ ...resume, hiddenSections: nextHidden, lastModified: Date.now() });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange({ ...resume, sectionOrder: next, lastModified: Date.now() });
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Design Control Tabs */}
      <div className="grid grid-cols-5 border-b border-slate-200 p-1 bg-slate-50 text-[11px] font-bold">
        {[
          { key: 'templates', label: 'Templates', icon: Layers },
          { key: 'colors', label: 'Colors', icon: Palette },
          { key: 'typography', label: 'Fonts', icon: Type },
          { key: 'layout', label: 'Layout', icon: Layout },
          { key: 'sections', label: 'Order', icon: SlidersHorizontal },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 flex flex-col items-center gap-1 rounded-lg transition ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Control Panels Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: TEMPLATES (20 Genuine Templates) */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Select Template ({TEMPLATES.length} Styles)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Change styles instantly. Your content is 100% preserved.
              </p>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTemplateCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                      templateCategoryFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredTemplates.map(tpl => {
                const isSelected = templateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between text-left relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      {/* Color accent top strip */}
                      <div 
                        className="h-1.5 w-full rounded-full mb-2"
                        style={{ backgroundColor: tpl.thumbnailColor }}
                      />
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{tpl.name}</h4>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[9px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {tpl.category}
                      </span>
                      {tpl.badge && (
                        <span className="text-indigo-600 font-bold">{tpl.badge}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COLOR CUSTOMIZATION */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                Color Palette Presets
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Curated by resume designers for optimum contrast and ATS scanner readability.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateDesign({
                        colorScheme: {
                          ...colorScheme,
                          primary: preset.primary,
                          headings: preset.headings,
                          sidebar: preset.sidebar,
                        },
                      });
                    }}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                      colorScheme.primary === preset.primary
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border shadow-2xs flex-shrink-0"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-800 block truncate">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Custom Color Adjustments
              </h3>

              {/* Accent / Primary */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Accent / Primary Color</span>
                  <span className="text-[10px] text-slate-400">Headings, dates, accents</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{colorScheme.primary}</span>
                  <input
                    type="color"
                    value={colorScheme.primary}
                    onChange={(e) => updateDesign({ colorScheme: { ...colorScheme, primary: e.target.value } })}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Headings Color */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Section Headings Color</span>
                  <span className="text-[10px] text-slate-400">Names and major section titles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{colorScheme.headings}</span>
                  <input
                    type="color"
                    value={colorScheme.headings}
                    onChange={(e) => updateDesign({ colorScheme: { ...colorScheme, headings: e.target.value } })}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Body Text Color */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Body Text Color</span>
                  <span className="text-[10px] text-slate-400">Descriptions and bullet points</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{colorScheme.bodyText}</span>
                  <input
                    type="color"
                    value={colorScheme.bodyText}
                    onChange={(e) => updateDesign({ colorScheme: { ...colorScheme, bodyText: e.target.value } })}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Paper Background</span>
                  <span className="text-[10px] text-slate-400">Default is pure white</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{colorScheme.background}</span>
                  <input
                    type="color"
                    value={colorScheme.background}
                    onChange={(e) => updateDesign({ colorScheme: { ...colorScheme, background: e.target.value } })}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Sidebar Background */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Sidebar Panel Color</span>
                  <span className="text-[10px] text-slate-400">For two-column templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{colorScheme.sidebar}</span>
                  <input
                    type="color"
                    value={colorScheme.sidebar}
                    onChange={(e) => updateDesign({ colorScheme: { ...colorScheme, sidebar: e.target.value } })}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Primary Font Family
              </label>
              <select
                value={typography.fontFamily}
                onChange={(e) => updateDesign({
                  typography: {
                    ...typography,
                    fontFamily: e.target.value,
                    nameFont: e.target.value,
                    headingFont: e.target.value,
                    bodyFont: e.target.value,
                  }
                })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Base Text Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateDesign({ typography: { ...typography, fontSize: size } })}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition ${
                      typography.fontSize === size
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Line Spacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['tight', 'normal', 'relaxed'] as const).map(spacing => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => updateDesign({ typography: { ...typography, lineSpacing: spacing } })}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition ${
                      typography.lineSpacing === spacing
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Spacing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Letter Spacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['tight', 'normal', 'wide'] as const).map(tracking => (
                  <button
                    key={tracking}
                    type="button"
                    onClick={() => updateDesign({ typography: { ...typography, letterSpacing: tracking } })}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition ${
                      typography.letterSpacing === tracking
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tracking}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAYOUT & PAGE SETTINGS */}
        {activeTab === 'layout' && (
          <div className="space-y-5">
            {/* Layout Columns */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Document Column Structure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'single', label: 'Single Column (Standard)' },
                  { key: 'two-column', label: 'Two Column (Sidebar)' },
                ].map(col => (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => updateDesign({ layout: { ...layout, layoutType: col.key as any } })}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition ${
                      layout.layoutType === col.key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Heading Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Section Heading Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'underlined', label: 'Underlined' },
                  { key: 'pill', label: 'Pill Badge' },
                  { key: 'filled', label: 'Solid Block' },
                  { key: 'left-bar', label: 'Left Accent Bar' },
                  { key: 'bordered', label: 'Bordered Rule' },
                  { key: 'clean', label: 'Minimalist Clean' },
                ].map(hd => (
                  <button
                    key={hd.key}
                    type="button"
                    onClick={() => updateDesign({ layout: { ...layout, sectionHeadingStyle: hd.key as any } })}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                      layout.sectionHeadingStyle === hd.key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {hd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bullet Styles */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Bullet Point Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'disc', label: '• Disc' },
                  { key: 'circle', label: '○ Circle' },
                  { key: 'square', label: '■ Square' },
                  { key: 'dash', label: '— Dash' },
                  { key: 'arrow', label: '▸ Arrow' },
                  { key: 'diamond', label: '◆ Diamond' },
                ].map(bullet => (
                  <button
                    key={bullet.key}
                    type="button"
                    onClick={() => updateDesign({ layout: { ...layout, bulletStyle: bullet.key as any } })}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      layout.bulletStyle === bullet.key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {bullet.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Paper Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['A4', 'Letter'] as const).map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateDesign({ pageSettings: { ...pageSettings, pageSize: sz } })}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      pageSettings.pageSize === sz
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sz === 'A4' ? 'A4 (210 x 297 mm)' : 'US Letter (8.5 x 11 in)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins / Page Padding */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Page Margins
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'spacious'] as const).map(pad => (
                  <button
                    key={pad}
                    type="button"
                    onClick={() => updateDesign({ layout: { ...layout, pagePadding: pad } })}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition ${
                      layout.pagePadding === pad
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pad}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Spacing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Section Spacing Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'relaxed'] as const).map(spacing => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => updateDesign({ layout: { ...layout, sectionSpacing: spacing } })}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition ${
                      (layout.sectionSpacing || 'normal') === spacing
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Visual Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Skills Display Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'tags', label: '🏷️ Badges' },
                  { key: 'dots', label: '●●● Dots' },
                  { key: 'bars', label: '📊 Bars' },
                ].map(style => (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => updateDesign({ layout: { ...layout, skillStyle: style.key as any } })}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      (layout.skillStyle || 'tags') === style.key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Guides & Polish */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Visual Guides & Elements
              </label>
              
              <label className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <span className="text-xs font-semibold text-slate-700">Show 1-Page Boundary Guide</span>
                <input
                  type="checkbox"
                  checked={layout.showPageBreakGuide !== false}
                  onChange={(e) => updateDesign({ layout: { ...layout, showPageBreakGuide: e.target.checked } })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <span className="text-xs font-semibold text-slate-700">Show Monogram Avatar (When no photo)</span>
                <input
                  type="checkbox"
                  checked={layout.showInitialsAvatar !== false}
                  onChange={(e) => updateDesign({ layout: { ...layout, showInitialsAvatar: e.target.checked } })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: SECTIONS REORDER & VISIBILITY */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                Section Ordering & Visibility
              </h3>
              <p className="text-[11px] text-slate-500">
                Hide or move sections up and down to adjust flow.
              </p>
            </div>

            <div className="space-y-2">
              {sectionOrder.map((key, index) => {
                const isHidden = hiddenSections.includes(key);
                const title = sectionLabelMap[key] || key;

                return (
                  <div
                    key={key}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
                      isHidden ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-slate-800">{title}</span>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveSection(index, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === sectionOrder.length - 1}
                        onClick={() => handleMoveSection(index, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      {/* Toggle Visibility */}
                      <button
                        type="button"
                        onClick={() => handleToggleSection(key)}
                        className={`p-1 rounded transition ${
                          isHidden ? 'text-slate-400 hover:text-indigo-600' : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                        title={isHidden ? 'Show section' : 'Hide section'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
