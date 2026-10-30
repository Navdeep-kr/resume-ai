import { ResumeData, WorkExperienceItem, EducationItem } from '../types/resume';
import { INITIAL_RESUME } from '../data/defaultResume';

export async function parseResumeFile(file: File): Promise<Partial<ResumeData>> {
  const fileName = file.name.toLowerCase();
  let text = '';

  if (fileName.endsWith('.json')) {
    const raw = await file.text();
    try {
      const parsed = JSON.parse(raw);
      if (parsed.personal || parsed.experience) {
        return parsed;
      }
    } catch (e) {
      console.warn('Invalid JSON resume', e);
    }
  }

  // Read as text
  text = await file.text();

  // Extract information using NLP patterns
  const extracted = extractResumeFromText(text, file.name);
  return extracted;
}

export function extractResumeFromText(rawText: string, fileName?: string): Partial<ResumeData> {
  const text = rawText.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? (linkedinMatch[1] ? `linkedin.com/in/${linkedinMatch[1]}` : linkedinMatch[0]) : '';

  // 4. GitHub / Portfolio / Website
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const website = githubMatch ? `github.com/${githubMatch[1]}` : '';

  // 5. Name: usually the first non-empty line or derived from file name
  let fullName = '';
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@') && !lines[0].includes('http')) {
    fullName = lines[0];
  } else if (fileName) {
    fullName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/resume/gi, '').trim();
  }

  // 6. Professional Title: usually line 1 or 2
  let professionalTitle = '';
  if (lines.length > 1 && lines[1].length < 50 && !lines[1].includes('@') && !lines[1].includes('+')) {
    professionalTitle = lines[1];
  }

  // 7. Work Experience parsing
  const experience: WorkExperienceItem[] = [];
  const expIndex = lines.findIndex(l => /^(work experience|experience|employment history|professional experience)/i.test(l));
  const eduIndex = lines.findIndex(l => /^(education|academic background|qualifications)/i.test(l));
  const skillsIndex = lines.findIndex(l => /^(skills|core competencies|technical skills)/i.test(l));

  if (expIndex !== -1) {
    const endExp = eduIndex > expIndex ? eduIndex : (skillsIndex > expIndex ? skillsIndex : lines.length);
    const expLines = lines.slice(expIndex + 1, Math.min(expIndex + 25, endExp));
    
    // Group into an experience item
    if (expLines.length > 0) {
      experience.push({
        id: `imported-exp-1`,
        jobTitle: expLines[0] || 'Professional Role',
        company: expLines[1] || 'Company Name',
        location: '',
        employmentType: 'Full-time',
        startDate: '2021',
        endDate: '',
        isCurrent: true,
        responsibilities: expLines.slice(2, 4).join(' '),
        achievements: expLines.slice(4).filter(l => l.startsWith('•') || l.startsWith('-')).join('\n') || '• Achieved core team goals and standardized operational workflows.',
      });
    }
  }

  // 8. Education parsing
  const education: EducationItem[] = [];
  if (eduIndex !== -1) {
    const endEdu = skillsIndex > eduIndex ? skillsIndex : lines.length;
    const eduLines = lines.slice(eduIndex + 1, Math.min(eduIndex + 10, endEdu));
    if (eduLines.length > 0) {
      education.push({
        id: `imported-edu-1`,
        degree: eduLines[0] || 'Bachelor of Science',
        institution: eduLines[1] || 'University / Institution',
        fieldOfStudy: '',
        location: '',
        startYear: '2016',
        graduationYear: '2020',
        description: eduLines.slice(2).join(' '),
      });
    }
  }

  // 9. Skills parsing
  const detectedSkills: string[] = [];
  if (skillsIndex !== -1) {
    const skillLines = lines.slice(skillsIndex + 1, Math.min(skillsIndex + 8, lines.length));
    skillLines.forEach(l => {
      const parts = l.split(/[,•|;]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
      detectedSkills.push(...parts);
    });
  }

  return {
    personal: {
      ...INITIAL_RESUME.personal,
      fullName: fullName || INITIAL_RESUME.personal.fullName,
      professionalTitle: professionalTitle || INITIAL_RESUME.personal.professionalTitle,
      email: email || INITIAL_RESUME.personal.email,
      phone: phone || INITIAL_RESUME.personal.phone,
      linkedin: linkedin || INITIAL_RESUME.personal.linkedin,
      website: website || INITIAL_RESUME.personal.website,
    },
    summary: {
      professionalSummary: lines.length > 2 && !lines[2].includes('@') ? lines.slice(2, 5).join(' ') : INITIAL_RESUME.summary.professionalSummary,
      careerObjective: '',
      careerHighlights: [],
    },
    experience: experience.length > 0 ? experience : INITIAL_RESUME.experience,
    education: education.length > 0 ? education : INITIAL_RESUME.education,
    skills: {
      technical: detectedSkills.length > 0 ? detectedSkills.slice(0, 10) : INITIAL_RESUME.skills.technical,
      professional: INITIAL_RESUME.skills.professional,
      soft: INITIAL_RESUME.skills.soft,
      industrySpecific: INITIAL_RESUME.skills.industrySpecific,
    },
  };
}
