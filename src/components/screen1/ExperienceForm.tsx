import React, { useState } from 'react';
import { WorkExperienceItem } from '../../types/resume';
import { 
  Briefcase, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, 
  RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Calendar, MapPin, Building
} from 'lucide-react';
import { aiImproveText } from '../../services/aiService';

interface ExperienceFormProps {
  experience: WorkExperienceItem[];
  targetRole?: string;
  onChange: (updated: WorkExperienceItem[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  targetRole,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(experience[0]?.id || null);
  const [aiLoadingKey, setAiLoadingKey] = useState<string | null>(null);

  const handleAddExperience = () => {
    const newId = `exp-${Date.now()}`;
    const newItem: WorkExperienceItem = {
      id: newId,
      jobTitle: '',
      company: '',
      location: '',
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      isCurrent: true,
      responsibilities: '',
      achievements: '',
    };
    onChange([newItem, ...experience]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, field: keyof WorkExperienceItem, value: any) => {
    onChange(
      experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleDelete = (id: string) => {
    onChange(experience.filter(exp => exp.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experience.length) return;
    const next = [...experience];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const handleAiAction = async (expId: string, actionType: 'experience' | 'achievements') => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;

    const actionKey = `${expId}-${actionType}`;
    setAiLoadingKey(actionKey);

    try {
      if (actionType === 'experience') {
        const enhanced = await aiImproveText('experience', exp.responsibilities, {
          role: exp.jobTitle || targetRole,
          company: exp.company,
        });
        handleUpdate(expId, 'responsibilities', enhanced);
      } else if (actionType === 'achievements') {
        const stronger = await aiImproveText('achievements', exp.achievements, {
          role: exp.jobTitle || targetRole,
          company: exp.company,
        });
        handleUpdate(expId, 'achievements', stronger);
      }
    } finally {
      setAiLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          List your career positions in reverse chronological order. Unlimited entries supported.
        </p>
        <button
          type="button"
          onClick={handleAddExperience}
          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Experience
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No Work Experience Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            If you're a recent graduate or changing careers, you can highlight projects, education, and skills instead.
          </p>
          <button
            type="button"
            onClick={handleAddExperience}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Add First Job
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((exp, index) => {
            const isExpanded = expandedId === exp.id;
            const titleDisplay = exp.jobTitle || 'New Position';
            const companyDisplay = exp.company ? ` at ${exp.company}` : '';

            return (
              <div
                key={exp.id}
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs transition"
              >
                {/* Collapsible Header */}
                <div 
                  className="px-4 py-3 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        {titleDisplay}
                        <span className="text-indigo-600 font-normal">{companyDisplay}</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{exp.startDate || 'Start'} – {exp.isCurrent ? 'Present' : exp.endDate || 'End'}</span>
                        {exp.location && <span>• {exp.location}</span>}
                        {exp.employmentType && <span>• {exp.employmentType}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === experience.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Form Fields */}
                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Job Title */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Job Title <span className="text-indigo-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleUpdate(exp.id, 'jobTitle', e.target.value)}
                          placeholder="e.g. Lead Software Engineer"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Company / Organization <span className="text-indigo-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdate(exp.id, 'company', e.target.value)}
                          placeholder="e.g. Microsoft / Acme Health"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => handleUpdate(exp.id, 'location', e.target.value)}
                          placeholder="e.g. New York, NY (or Remote)"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Employment Type */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Employment Type
                        </label>
                        <select
                          value={exp.employmentType}
                          onChange={(e) => handleUpdate(exp.id, 'employmentType', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>

                      {/* Dates */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                          placeholder="e.g. Mar 2021 or 2021-03"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            End Date
                          </label>
                          <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => handleUpdate(exp.id, 'isCurrent', e.target.checked)}
                              className="accent-indigo-600 rounded"
                            />
                            I currently work here
                          </label>
                        </div>
                        <input
                          type="text"
                          disabled={exp.isCurrent}
                          value={exp.isCurrent ? 'Present' : exp.endDate}
                          onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                          placeholder="e.g. Dec 2023 or Present"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Role Responsibilities & Scope
                        </label>
                        <button
                          type="button"
                          disabled={aiLoadingKey === `${exp.id}-experience`}
                          onClick={() => handleAiAction(exp.id, 'experience')}
                          className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded transition flex items-center gap-1"
                        >
                          {aiLoadingKey === `${exp.id}-experience` ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          AI Polish Scope
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={exp.responsibilities}
                        onChange={(e) => handleUpdate(exp.id, 'responsibilities', e.target.value)}
                        placeholder="Overview of your core responsibilities, team size, systems or budgets managed..."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>

                    {/* Achievements */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Key Achievements & Measurable Results (Bullet points)
                        </label>
                        <button
                          type="button"
                          disabled={aiLoadingKey === `${exp.id}-achievements`}
                          onClick={() => handleAiAction(exp.id, 'achievements')}
                          className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded transition flex items-center gap-1"
                        >
                          {aiLoadingKey === `${exp.id}-achievements` ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          AI Strengthen & Quantify
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={exp.achievements}
                        onChange={(e) => handleUpdate(exp.id, 'achievements', e.target.value)}
                        placeholder="• Re-architected messaging pipelines using Kafka, reducing p99 latency from 450ms to 68ms.&#10;• Reduced quarterly cloud compute spend by $180,000 via spot instance orchestration."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-sans leading-relaxed"
                      />
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Tip: Start with strong action verbs and include metrics (%, $, numbers) wherever possible.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
