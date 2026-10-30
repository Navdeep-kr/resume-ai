import React, { useState } from 'react';
import { SkillsData } from '../../types/resume';
import { Sparkles, Plus, X, Search, Tag, Check } from 'lucide-react';
import { getRecommendedSkillsForRole } from '../../services/aiService';

interface SkillsFormProps {
  skills: SkillsData;
  targetRole?: string;
  profession?: string;
  onChange: (updated: SkillsData) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({
  skills,
  targetRole,
  profession,
  onChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<keyof SkillsData>('technical');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const recommendations = getRecommendedSkillsForRole(targetRole || profession || 'Technology');

  const addSkill = (category: keyof SkillsData, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const current = skills[category] || [];
    if (!current.includes(trimmed)) {
      onChange({
        ...skills,
        [category]: [...current, trimmed],
      });
    }
  };

  const removeSkill = (category: keyof SkillsData, skillName: string) => {
    const current = skills[category] || [];
    onChange({
      ...skills,
      [category]: current.filter(s => s !== skillName),
    });
  };

  const handleApplyAllRecommended = () => {
    onChange({
      technical: Array.from(new Set([...(skills.technical || []), ...recommendations.technical])),
      professional: Array.from(new Set([...(skills.professional || []), ...recommendations.professional])),
      soft: Array.from(new Set([...(skills.soft || []), ...recommendations.soft])),
      industrySpecific: Array.from(new Set([...(skills.industrySpecific || []), ...recommendations.industry])),
    });
  };

  // Determine which suggestions to display for active category
  const activeSuggestions = 
    activeCategory === 'technical' ? recommendations.technical :
    activeCategory === 'professional' ? recommendations.professional :
    activeCategory === 'soft' ? recommendations.soft : recommendations.industry;

  const filteredSuggestions = activeSuggestions.filter(s => 
    s.toLowerCase().includes(searchFilter.toLowerCase()) && 
    !(skills[activeCategory] || []).includes(s)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Recommendations */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Smart Skill Suggestions for {targetRole || profession || 'Your Role'}
            </h4>
            <p className="text-[11px] text-slate-500">
              Curated by AI based on thousands of real job postings in your domain.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyAllRecommended}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex-shrink-0"
        >
          Add All Recommended
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { key: 'technical', label: 'Technical Skills', count: skills.technical?.length || 0 },
          { key: 'professional', label: 'Professional Skills', count: skills.professional?.length || 0 },
          { key: 'soft', label: 'Soft Skills', count: skills.soft?.length || 0 },
          { key: 'industrySpecific', label: 'Industry Expertise', count: skills.industrySpecific?.length || 0 },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveCategory(tab.key as keyof SkillsData);
              setSearchFilter('');
            }}
            className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeCategory === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeCategory === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Skills Pill Container */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Your Selected {activeCategory} Skills:
        </label>
        <div className="p-3 min-h-[56px] bg-slate-50 border border-slate-200/90 rounded-xl flex flex-wrap gap-2 items-center">
          {(skills[activeCategory] || []).length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              No skills added yet. Type below or click from suggestions.
            </span>
          ) : (
            (skills[activeCategory] || []).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs group hover:border-indigo-400 transition"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(activeCategory, skill)}
                  className="text-slate-400 hover:text-rose-600 transition"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Custom Skill Input & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Add custom skill */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Add Custom Skill (Press Enter)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (customSkillInput.trim()) {
                    addSkill(activeCategory, customSkillInput);
                    setCustomSkillInput('');
                  }
                }
              }}
              placeholder="e.g. GraphQL, Six Sigma, Kubernetes..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => {
                if (customSkillInput.trim()) {
                  addSkill(activeCategory, customSkillInput);
                  setCustomSkillInput('');
                }
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Filter suggestions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Search Suggested Skills
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter recommendations..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Suggested Skills Pill Cloud */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Click to Add Recommended Skills:
        </label>
        {filteredSuggestions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">All suggested skills in this category have been added!</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {filteredSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addSkill(activeCategory, s)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-400" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
