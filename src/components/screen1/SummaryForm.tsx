import React, { useState } from 'react';
import { SummaryData } from '../../types/resume';
import { Sparkles, Plus, Trash2, Check, RefreshCw, Wand2, Lightbulb } from 'lucide-react';
import { aiImproveText } from '../../services/aiService';

interface SummaryFormProps {
  summary: SummaryData;
  targetRole?: string;
  profession?: string;
  onChange: (updated: SummaryData) => void;
}

export const SummaryForm: React.FC<SummaryFormProps> = ({
  summary,
  targetRole,
  profession,
  onChange,
}) => {
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [highlightInput, setHighlightInput] = useState('');

  const handleAiAction = async (type: 'summary' | 'objective' | 'concise' | 'grammar') => {
    setIsAiLoading(type);
    try {
      if (type === 'summary') {
        const enhanced = await aiImproveText('summary', summary.professionalSummary || '', {
          role: targetRole || profession,
        });
        onChange({ ...summary, professionalSummary: enhanced });
      } else if (type === 'objective') {
        const enhanced = await aiImproveText('objective', summary.careerObjective || '', {
          role: targetRole || profession,
        });
        onChange({ ...summary, careerObjective: enhanced });
      } else if (type === 'concise') {
        const concise = await aiImproveText('concise', summary.professionalSummary || '', {
          role: targetRole || profession,
        });
        onChange({ ...summary, professionalSummary: concise });
      } else if (type === 'grammar') {
        const polished = await aiImproveText('grammar', summary.professionalSummary || '', {
          role: targetRole || profession,
        });
        onChange({ ...summary, professionalSummary: polished });
      }
    } finally {
      setIsAiLoading(null);
    }
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    onChange({
      ...summary,
      careerHighlights: [...(summary.careerHighlights || []), highlightInput.trim()],
    });
    setHighlightInput('');
  };

  const removeHighlight = (idx: number) => {
    const next = [...(summary.careerHighlights || [])];
    next.splice(idx, 1);
    onChange({ ...summary, careerHighlights: next });
  };

  return (
    <div className="space-y-6">
      {/* Professional Summary */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Professional Summary
          </label>
          {/* AI Assistance Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={!!isAiLoading}
              onClick={() => handleAiAction('summary')}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-md transition flex items-center gap-1 shadow-2xs"
            >
              {isAiLoading === 'summary' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-indigo-600" />
              )}
              {summary.professionalSummary ? 'AI Improve' : 'AI Generate'}
            </button>

            <button
              type="button"
              disabled={!!isAiLoading || !summary.professionalSummary}
              onClick={() => handleAiAction('concise')}
              className="px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition disabled:opacity-40"
              title="Remove filler words and make punchy"
            >
              {isAiLoading === 'concise' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Make Concise'}
            </button>

            <button
              type="button"
              disabled={!!isAiLoading || !summary.professionalSummary}
              onClick={() => handleAiAction('grammar')}
              className="px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition disabled:opacity-40"
              title="Fix punctuation and grammar"
            >
              {isAiLoading === 'grammar' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Fix Grammar'}
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={summary.professionalSummary}
          onChange={(e) => onChange({ ...summary, professionalSummary: e.target.value })}
          placeholder="Briefly describe your career narrative, years of experience, core technical or domain expertise, and signature accomplishments..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
        />
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
          <span>Tip: 3–4 punchy sentences describing your domain experience and signature strengths.</span>
          <span>{summary.professionalSummary?.length || 0} characters</span>
        </div>
      </div>

      {/* Career Objective */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Career Objective (Optional)
          </label>
          <button
            type="button"
            disabled={!!isAiLoading}
            onClick={() => handleAiAction('objective')}
            className="px-2.5 py-1 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/80 rounded-md transition flex items-center gap-1 shadow-2xs"
          >
            {isAiLoading === 'objective' ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Wand2 className="w-3 h-3 text-violet-600" />
            )}
            AI Generate Objective
          </button>
        </div>
        <input
          type="text"
          value={summary.careerObjective}
          onChange={(e) => onChange({ ...summary, careerObjective: e.target.value })}
          placeholder="e.g. To lead resilient engineering teams delivering mission-critical SaaS products at enterprise scale."
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

      {/* Career Highlights */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Key Career Highlights (Optional)
        </label>
        
        {summary.careerHighlights && summary.careerHighlights.length > 0 && (
          <ul className="space-y-2 mb-3">
            {summary.careerHighlights.map((hl, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200/70 rounded-lg text-xs">
                <div className="flex items-start gap-2 flex-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-800">{hl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeHighlight(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition"
                  title="Remove highlight"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addHighlight();
              }
            }}
            placeholder="e.g. Designed high-throughput payment routing processing $240M annually..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
