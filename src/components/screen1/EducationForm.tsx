import React, { useState } from 'react';
import { EducationItem } from '../../types/resume';
import { GraduationCap, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

interface EducationFormProps {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(education[0]?.id || null);

  const handleAddEducation = () => {
    const newId = `edu-${Date.now()}`;
    const newItem: EducationItem = {
      id: newId,
      degree: '',
      institution: '',
      fieldOfStudy: '',
      location: '',
      startYear: '',
      graduationYear: '',
      gpa: '',
      description: '',
    };
    onChange([...education, newItem]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, field: keyof EducationItem, value: any) => {
    onChange(
      education.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const handleDelete = (id: string) => {
    onChange(education.filter(edu => edu.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= education.length) return;
    const next = [...education];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Add degrees, diplomas, university certificates, or high school education.
        </p>
        <button
          type="button"
          onClick={handleAddEducation}
          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
          <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
          <h4 className="text-sm font-bold text-slate-700">No Education Entries</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
            Add your degrees or qualifications to validate your academic background.
          </p>
          <button
            type="button"
            onClick={handleAddEducation}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Add Degree
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, index) => {
            const isExpanded = expandedId === edu.id;
            const degreeDisplay = edu.degree || 'Degree / Qualification';
            const instDisplay = edu.institution ? ` at ${edu.institution}` : '';

            return (
              <div
                key={edu.id}
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs transition"
              >
                {/* Header */}
                <div 
                  className="px-4 py-3 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        {degreeDisplay}
                        <span className="text-indigo-600 font-normal">{instDisplay}</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{edu.startYear || 'Start'} – {edu.graduationYear || 'Graduation'}</span>
                        {edu.location && <span>• {edu.location}</span>}
                        {edu.gpa && <span>• GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                      disabled={index === education.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(edu.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete education"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Degree */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Degree / Credential <span className="text-indigo-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                          placeholder="e.g. Bachelor of Science in Computer Science"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Institution */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Institution / University <span className="text-indigo-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdate(edu.id, 'institution', e.target.value)}
                          placeholder="e.g. University of California, Berkeley"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Field of Study */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Field of Study / Major
                        </label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleUpdate(edu.id, 'fieldOfStudy', e.target.value)}
                          placeholder="e.g. Software Systems & Artificial Intelligence"
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
                          value={edu.location}
                          onChange={(e) => handleUpdate(edu.id, 'location', e.target.value)}
                          placeholder="e.g. Berkeley, CA"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Start Year */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Start Year
                        </label>
                        <input
                          type="text"
                          value={edu.startYear}
                          onChange={(e) => handleUpdate(edu.id, 'startYear', e.target.value)}
                          placeholder="e.g. 2018"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Graduation Year */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) => handleUpdate(edu.id, 'graduationYear', e.target.value)}
                          placeholder="e.g. 2022 (or Expected May 2025)"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* GPA */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Grade / GPA / Honors (Optional)
                        </label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => handleUpdate(edu.id, 'gpa', e.target.value)}
                          placeholder="e.g. 3.85 / 4.0, Magna Cum Laude, First Class"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Description & Relevant Coursework (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={edu.description || ''}
                          onChange={(e) => handleUpdate(edu.id, 'description', e.target.value)}
                          placeholder="Relevant coursework, academic societies, leadership roles, thesis topic..."
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
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
