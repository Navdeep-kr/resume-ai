import { ResumeData } from '../types/resume';
import { INITIAL_RESUME } from '../data/defaultResume';

const STORAGE_KEY_RESUMES = 'resume_ai_all_documents';
const STORAGE_KEY_CURRENT_ID = 'resume_ai_active_id';
const STORAGE_KEY_VERSIONS_PREFIX = 'resume_ai_versions_';

export interface ResumeSummary {
  id: string;
  title: string;
  fullName: string;
  lastModified: number;
  templateId: string;
}

export interface VersionSnapshot {
  timestamp: number;
  label: string;
  resume: ResumeData;
}

export function getAllResumes(): ResumeData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load resumes from localStorage', e);
  }
  // Initialize with default
  const defaultList = [INITIAL_RESUME];
  saveAllResumes(defaultList);
  return defaultList;
}

export function saveAllResumes(resumes: ResumeData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(resumes));
  } catch (e) {
    console.error('Failed to save resumes', e);
  }
}

export function getActiveResume(): ResumeData {
  const resumes = getAllResumes();
  const activeId = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
  const found = resumes.find(r => r.id === activeId);
  if (found) return found;
  if (resumes.length > 0) {
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, resumes[0].id);
    return resumes[0];
  }
  return INITIAL_RESUME;
}

export function saveResume(resume: ResumeData): void {
  const resumes = getAllResumes();
  const index = resumes.findIndex(r => r.id === resume.id);
  const updated = { ...resume, lastModified: Date.now() };

  if (index !== -1) {
    resumes[index] = updated;
  } else {
    resumes.push(updated);
  }

  saveAllResumes(resumes);
  localStorage.setItem(STORAGE_KEY_CURRENT_ID, resume.id);
}

export function createNewResume(title: string = 'New Resume', baseResume?: Partial<ResumeData>): ResumeData {
  const newResume: ResumeData = {
    ...INITIAL_RESUME,
    id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    lastModified: Date.now(),
    ...baseResume,
    personal: {
      ...INITIAL_RESUME.personal,
      ...(baseResume?.personal || {}),
    },
  };

  const resumes = getAllResumes();
  resumes.push(newResume);
  saveAllResumes(resumes);
  localStorage.setItem(STORAGE_KEY_CURRENT_ID, newResume.id);
  return newResume;
}

export function duplicateResume(id: string): ResumeData | null {
  const resumes = getAllResumes();
  const target = resumes.find(r => r.id === id);
  if (!target) return null;

  const clone: ResumeData = {
    ...JSON.parse(JSON.stringify(target)),
    id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${target.title} (Copy)`,
    lastModified: Date.now(),
  };

  resumes.push(clone);
  saveAllResumes(resumes);
  localStorage.setItem(STORAGE_KEY_CURRENT_ID, clone.id);
  return clone;
}

export function deleteResume(id: string): ResumeData {
  let resumes = getAllResumes();
  resumes = resumes.filter(r => r.id !== id);
  if (resumes.length === 0) {
    resumes = [INITIAL_RESUME];
  }
  saveAllResumes(resumes);
  localStorage.setItem(STORAGE_KEY_CURRENT_ID, resumes[0].id);
  return resumes[0];
}

// Version History Management
export function saveVersionSnapshot(resume: ResumeData, label: string = 'Auto-save checkpoint'): void {
  try {
    const key = `${STORAGE_KEY_VERSIONS_PREFIX}${resume.id}`;
    const raw = localStorage.getItem(key);
    let versions: VersionSnapshot[] = raw ? JSON.parse(raw) : [];

    versions.unshift({
      timestamp: Date.now(),
      label,
      resume: JSON.parse(JSON.stringify(resume)),
    });

    // Keep max 15 snapshots per resume
    if (versions.length > 15) {
      versions = versions.slice(0, 15);
    }
    localStorage.setItem(key, JSON.stringify(versions));
  } catch (e) {
    console.error('Failed to save version snapshot', e);
  }
}

export function getVersionSnapshots(resumeId: string): VersionSnapshot[] {
  try {
    const key = `${STORAGE_KEY_VERSIONS_PREFIX}${resumeId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
