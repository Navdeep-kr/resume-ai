import React from 'react';
import { AtsAuditReport, auditResumeForAts } from '../../services/atsAuditService';
import { ResumeData } from '../../types/resume';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Sparkles, 
  TrendingUp, Zap, ArrowRight, Award, BarChart3, HelpCircle 
} from 'lucide-react';

interface AtsAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: AtsAuditReport;
  resume?: ResumeData;
}

export const AtsAuditModal: React.FC<AtsAuditModalProps> = ({
  isOpen,
  onClose,
  report: propReport,
  resume,
}) => {
  if (!isOpen) return null;

  const report = propReport || (resume ? auditResumeForAts(resume) : null);
  if (!report) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>ATS & Resume Quality Auditor</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  Live Audit
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Real-time compliance checks for Applicant Tracking Systems & recruiters.
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

        {/* Score Hero Card */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${getScoreColor(report.score)}`}>
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-white border shadow-sm flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black leading-none">{report.score}%</span>
              <span className="text-[10px] font-bold uppercase mt-0.5 opacity-80">{report.grade}</span>
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {report.score >= 85 ? 'Highly Competitive Resume' : 'Good Progress — Needs Polish'}
              </h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                {report.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Action Verbs</span>
            <span className="text-sm font-black text-slate-800">{report.powerVerbsFound.length}</span>
            <span className="text-[10px] text-emerald-600 block font-semibold">Active Verbs</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantified Metrics</span>
            <span className="text-sm font-black text-slate-800">{report.metricsCount}</span>
            <span className="text-[10px] text-indigo-600 block font-semibold">Numbers / % / $</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Words</span>
            <span className="text-sm font-black text-slate-800">{report.wordCount}</span>
            <span className="text-[10px] text-slate-500 block font-semibold">
              {report.wordCount > 600 ? '2-Page Density' : '1-Page Density'}
            </span>
          </div>
        </div>

        {/* Actionable Recommendations */}
        {report.actionableImprovements.length > 0 && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Recommended Next Steps To Reach 100%</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-800">
              {report.actionableImprovements.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-600">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Checks Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Automated Quality Checks
          </h4>
          <div className="space-y-1.5">
            {report.checks.map(check => (
              <div 
                key={check.id}
                className="p-2.5 bg-white border border-slate-200/90 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {check.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                  {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                  {check.status === 'fail' && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-bold text-slate-800 block">{check.label}</span>
                    <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">{check.detail}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                  check.status === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                  check.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Power Verbs Cloud */}
        {report.powerVerbsFound.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Power Verbs Detected:
            </span>
            <div className="flex flex-wrap gap-1">
              {report.powerVerbsFound.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Got It, Back to Editing
          </button>
        </div>
      </div>
    </div>
  );
};
