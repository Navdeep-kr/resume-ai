import React, { useState } from 'react';
import { BULLET_LIBRARY, ActionBulletItem } from '../../data/bulletLibrary';
import { BookOpen, Search, Copy, Check, Plus, Tag, Sparkles, Filter } from 'lucide-react';

interface BulletLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBullet?: (bulletText: string) => void;
}

export const BulletLibraryModal: React.FC<BulletLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertBullet,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Technology', 'Management', 'Marketing', 'Healthcare', 'Education', 'Finance', 'Sales', 'Product'];

  const filteredBullets = BULLET_LIBRARY.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.bullet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (text: string) => {
    if (onInsertBullet) {
      onInsertBullet(text);
      onClose();
    } else {
      handleCopy('inserted', text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>Power Action Bullet Library</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  Recruiter-Vetted
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                100+ proven, metric-driven achievements. Click to copy or insert directly into your resume.
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

        {/* Search & Category Filter */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. latency, revenue, budget, mentored, SEO, pipeline)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bullet List Container */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredBullets.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No bullets match your search query. Try another keyword.
            </div>
          ) : (
            filteredBullets.map(item => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-2xl transition space-y-2 group shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {item.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      {item.bullet}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.bullet)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg transition inline-flex items-center gap-1"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onInsertBullet && (
                      <button
                        type="button"
                        onClick={() => handleInsert(item.bullet)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-1 shadow-2xs"
                        title="Insert into your experience"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/50">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] text-slate-500 font-medium bg-white px-1.5 py-0.2 rounded border border-slate-200/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredBullets.length} recruiter-approved bullet points.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
