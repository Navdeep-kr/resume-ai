import React, { useState } from 'react';
import { 
  AdditionalSections, ProjectItem, CertificationItem, AwardItem, 
  LanguageItem, LicenseItem, SectionKey 
} from '../../types/resume';
import { 
  Plus, Trash2, Code, Award, Globe, BookOpen, CheckCircle2, 
  Eye, EyeOff, ArrowUp, ArrowDown, ExternalLink, ChevronDown, ChevronUp, FolderPlus 
} from 'lucide-react';

interface AdditionalSectionsFormProps {
  additional: AdditionalSections;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  onChange: (updated: AdditionalSections) => void;
  onUpdateSectionOrder: (order: SectionKey[]) => void;
  onToggleSectionVisibility: (key: SectionKey) => void;
}

export const AdditionalSectionsForm: React.FC<AdditionalSectionsFormProps> = ({
  additional,
  sectionOrder,
  hiddenSections,
  onChange,
  onUpdateSectionOrder,
  onToggleSectionVisibility,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'certifications' | 'awards' | 'languages' | 'licenses'>('projects');

  // Helpers for Projects
  const addProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: '',
      role: '',
      link: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: [],
    };
    onChange({
      ...additional,
      projects: [...(additional.projects || []), newItem],
    });
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    onChange({
      ...additional,
      projects: (additional.projects || []).map(p => p.id === id ? { ...p, [field]: value } : p),
    });
  };

  const deleteProject = (id: string) => {
    onChange({
      ...additional,
      projects: (additional.projects || []).filter(p => p.id !== id),
    });
  };

  // Helpers for Certifications
  const addCertification = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
    };
    onChange({
      ...additional,
      certifications: [...(additional.certifications || []), newItem],
    });
  };

  const updateCertification = (id: string, field: keyof CertificationItem, value: any) => {
    onChange({
      ...additional,
      certifications: (additional.certifications || []).map(c => c.id === id ? { ...c, [field]: value } : c),
    });
  };

  const deleteCertification = (id: string) => {
    onChange({
      ...additional,
      certifications: (additional.certifications || []).filter(c => c.id !== id),
    });
  };

  // Helpers for Awards
  const addAward = () => {
    const newItem: AwardItem = {
      id: `award-${Date.now()}`,
      title: '',
      issuer: '',
      date: '',
      description: '',
    };
    onChange({
      ...additional,
      awards: [...(additional.awards || []), newItem],
    });
  };

  const updateAward = (id: string, field: keyof AwardItem, value: any) => {
    onChange({
      ...additional,
      awards: (additional.awards || []).map(a => a.id === id ? { ...a, [field]: value } : a),
    });
  };

  const deleteAward = (id: string) => {
    onChange({
      ...additional,
      awards: (additional.awards || []).filter(a => a.id !== id),
    });
  };

  // Helpers for Languages
  const addLanguage = () => {
    const newItem: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: '',
      proficiency: 'Professional',
    };
    onChange({
      ...additional,
      languages: [...(additional.languages || []), newItem],
    });
  };

  const updateLanguage = (id: string, field: keyof LanguageItem, value: any) => {
    onChange({
      ...additional,
      languages: (additional.languages || []).map(l => l.id === id ? { ...l, [field]: value } : l),
    });
  };

  const deleteLanguage = (id: string) => {
    onChange({
      ...additional,
      languages: (additional.languages || []).filter(l => l.id !== id),
    });
  };

  // Helpers for Licenses
  const addLicense = () => {
    const newItem: LicenseItem = {
      id: `lic-${Date.now()}`,
      name: '',
      issuingAuthority: '',
      licenseNumber: '',
      validUntil: '',
    };
    onChange({
      ...additional,
      licenses: [...(additional.licenses || []), newItem],
    });
  };

  const updateLicense = (id: string, field: keyof LicenseItem, value: any) => {
    onChange({
      ...additional,
      licenses: (additional.licenses || []).map(l => l.id === id ? { ...l, [field]: value } : l),
    });
  };

  const deleteLicense = (id: string) => {
    onChange({
      ...additional,
      licenses: (additional.licenses || []).filter(l => l.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>Enhance your resume with targeted sections relevant to your specific profession and achievements.</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        {[
          { key: 'projects', label: 'Projects', icon: Code, count: additional.projects?.length || 0 },
          { key: 'certifications', label: 'Certifications', icon: Award, count: additional.certifications?.length || 0 },
          { key: 'awards', label: 'Awards & Honors', icon: Award, count: additional.awards?.length || 0 },
          { key: 'languages', label: 'Languages', icon: Globe, count: additional.languages?.length || 0 },
          { key: 'licenses', label: 'Licenses & Credentials', icon: CheckCircle2, count: additional.licenses?.length || 0 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Projects Portfolio</h4>
            <button
              type="button"
              onClick={addProject}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          {(additional.projects || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed rounded-xl">
              No projects added yet. Click "+ Add Project" to showcase apps, research, or client initiatives.
            </p>
          ) : (
            <div className="space-y-3">
              {(additional.projects || []).map((p, idx) => (
                <div key={p.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Project #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => deleteProject(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => updateProject(p.id, 'title', e.target.value)}
                      placeholder="Project Title (e.g. Distributed Rate Limiter)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={p.role || ''}
                      onChange={(e) => updateProject(p.id, 'role', e.target.value)}
                      placeholder="Your Role (e.g. Creator & Maintainer)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={p.link || ''}
                      onChange={(e) => updateProject(p.id, 'link', e.target.value)}
                      placeholder="Project URL / GitHub link"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={p.technologies?.join(', ') || ''}
                      onChange={(e) => updateProject(p.id, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="Technologies (comma-separated, e.g. React, Go, Docker)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <textarea
                      rows={2}
                      value={p.description}
                      onChange={(e) => updateProject(p.id, 'description', e.target.value)}
                      placeholder="Brief description of the problem solved, architectural choices, and measurable results..."
                      className="sm:col-span-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CERTIFICATIONS TAB */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Certifications</h4>
            <button
              type="button"
              onClick={addCertification}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>
          </div>

          {(additional.certifications || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed rounded-xl">
              No certifications added yet. Click "+ Add Certification" to list credentials like AWS, PMP, CPA, or BLS.
            </p>
          ) : (
            <div className="space-y-3">
              {(additional.certifications || []).map((c, idx) => (
                <div key={c.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Certification #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => deleteCertification(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCertification(c.id, 'name', e.target.value)}
                      placeholder="Certification Name (e.g. AWS Solutions Architect Professional)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={c.issuer}
                      onChange={(e) => updateCertification(c.id, 'issuer', e.target.value)}
                      placeholder="Issuing Authority (e.g. Amazon Web Services)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={c.issueDate || ''}
                      onChange={(e) => updateCertification(c.id, 'issueDate', e.target.value)}
                      placeholder="Issue Date (e.g. Aug 2023)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={c.credentialId || ''}
                      onChange={(e) => updateCertification(c.id, 'credentialId', e.target.value)}
                      placeholder="Credential ID / License #"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AWARDS TAB */}
      {activeTab === 'awards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Honors & Awards</h4>
            <button
              type="button"
              onClick={addAward}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Award
            </button>
          </div>

          {(additional.awards || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed rounded-xl">
              No awards added. Add professional honors, hackathon wins, or company awards.
            </p>
          ) : (
            <div className="space-y-3">
              {(additional.awards || []).map((a, idx) => (
                <div key={a.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Award #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => deleteAward(a.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={a.title}
                      onChange={(e) => updateAward(a.id, 'title', e.target.value)}
                      placeholder="Award Title (e.g. Innovator of the Year)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={a.issuer}
                      onChange={(e) => updateAward(a.id, 'issuer', e.target.value)}
                      placeholder="Conferred By (e.g. Industry Council / Employer)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={a.date || ''}
                      onChange={(e) => updateAward(a.id, 'date', e.target.value)}
                      placeholder="Date (e.g. 2023)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={a.description || ''}
                      onChange={(e) => updateAward(a.id, 'description', e.target.value)}
                      placeholder="Short description of achievement..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LANGUAGES TAB */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Languages</h4>
            <button
              type="button"
              onClick={addLanguage}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Language
            </button>
          </div>

          {(additional.languages || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed rounded-xl">
              No languages listed. Add languages you speak and your proficiency level.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(additional.languages || []).map((l, idx) => (
                <div key={l.id} className="p-3 bg-slate-50/80 border border-slate-200 rounded-lg flex items-center gap-2">
                  <input
                    type="text"
                    value={l.language}
                    onChange={(e) => updateLanguage(l.id, 'language', e.target.value)}
                    placeholder="Language (e.g. English, French)"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <select
                    value={l.proficiency}
                    onChange={(e) => updateLanguage(l.id, 'proficiency', e.target.value as any)}
                    className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional">Professional</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Basic">Basic</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteLanguage(l.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LICENSES TAB */}
      {activeTab === 'licenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Licenses & Registrations</h4>
            <button
              type="button"
              onClick={addLicense}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add License
            </button>
          </div>

          {(additional.licenses || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed rounded-xl">
              No licenses added. Critical for healthcare, legal, engineering, and teaching credentials.
            </p>
          ) : (
            <div className="space-y-3">
              {(additional.licenses || []).map((lic, idx) => (
                <div key={lic.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">License #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => deleteLicense(lic.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={lic.name}
                      onChange={(e) => updateLicense(lic.id, 'name', e.target.value)}
                      placeholder="License Name (e.g. Registered Nurse / PE License)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={lic.issuingAuthority}
                      onChange={(e) => updateLicense(lic.id, 'issuingAuthority', e.target.value)}
                      placeholder="State Board / Authority (e.g. State Medical Board)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={lic.licenseNumber || ''}
                      onChange={(e) => updateLicense(lic.id, 'licenseNumber', e.target.value)}
                      placeholder="License Number"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={lic.validUntil || ''}
                      onChange={(e) => updateLicense(lic.id, 'validUntil', e.target.value)}
                      placeholder="Valid Until (e.g. Dec 2026)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
