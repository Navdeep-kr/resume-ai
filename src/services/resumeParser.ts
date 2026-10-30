import { ResumeData, WorkExperienceItem, EducationItem, SkillsData, ProjectItem, CertificationItem, LanguageItem } from '../types/resume';
import { INITIAL_RESUME } from '../data/defaultResume';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to use CDN so it works in browser without complex Vite bundling
try {
  if (typeof window !== 'undefined' && pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.8.69'}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup warning:', e);
}

export interface ExtractedResumeSummary {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  experienceCount: number;
  educationCount: number;
  skillsCount: number;
  rawTextPreview: string;
}

export async function parseAnyResumeFile(file: File): Promise<{
  data: Partial<ResumeData>;
  summary: ExtractedResumeSummary;
}> {
  const fileName = file.name.toLowerCase();
  let extractedText = '';

  // 1. JSON file
  if (fileName.endsWith('.json')) {
    const raw = await file.text();
    try {
      const parsed = JSON.parse(raw);
      if (parsed.personal || parsed.experience) {
        return {
          data: parsed,
          summary: {
            name: parsed.personal?.fullName || 'Imported User',
            title: parsed.personal?.professionalTitle || '',
            email: parsed.personal?.email || '',
            phone: parsed.personal?.phone || '',
            location: parsed.personal?.location || '',
            experienceCount: parsed.experience?.length || 0,
            educationCount: parsed.education?.length || 0,
            skillsCount: (parsed.skills?.technical?.length || 0) + (parsed.skills?.professional?.length || 0),
            rawTextPreview: JSON.stringify(parsed, null, 2).slice(0, 300),
          },
        };
      }
    } catch (e) {
      console.warn('Invalid JSON format, treating as text', e);
    }
  }

  // 2. Word Document (.docx)
  if (fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value || '';
    } catch (err) {
      console.warn('Mammoth docx parse failed, falling back to text read:', err);
      extractedText = await file.text();
    }
  }
  // 3. PDF Document (.pdf)
  else if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const textPieces: string[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        textPieces.push(pageText);
      }
      extractedText = textPieces.join('\n');
    } catch (err) {
      console.warn('PDF.js parse failed, trying binary stream scan:', err);
      extractedText = await extractTextFromPdfFallback(file);
    }
  }
  // 4. HTML document (.html, .htm)
  else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    const html = await file.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    extractedText = doc.body.textContent || '';
  }
  // 5. Plain text, markdown, rtf, csv, or any other textual file
  else {
    try {
      extractedText = await file.text();
    } catch (e) {
      extractedText = `File: ${file.name}`;
    }
  }

  // Perform multi-section NLP extraction
  const data = extractResumeFromText(extractedText, file.name);

  const summary: ExtractedResumeSummary = {
    name: data.personal?.fullName || 'Extracted Profile',
    title: data.personal?.professionalTitle || '',
    email: data.personal?.email || '',
    phone: data.personal?.phone || '',
    location: data.personal?.location || '',
    experienceCount: data.experience?.length || 0,
    educationCount: data.education?.length || 0,
    skillsCount: (data.skills?.technical?.length || 0) + (data.skills?.professional?.length || 0),
    rawTextPreview: extractedText.slice(0, 300).trim(),
  };

  return { data, summary };
}

// Fallback PDF text extractor in case PDF worker fails
async function extractTextFromPdfFallback(file: File): Promise<string> {
  const text = await file.text();
  // Strip non-printable characters and extract strings in brackets or text tokens
  const clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n');
  return clean;
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
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@') && !lines[0].includes('http') && !/^(resume|curriculum|cv)/i.test(lines[0])) {
    fullName = lines[0];
  } else if (fileName) {
    fullName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/resume|cv/gi, '').trim();
    fullName = fullName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // 6. Professional Title
  let professionalTitle = '';
  for (let i = 1; i < Math.min(lines.length, 5); i++) {
    const l = lines[i];
    if (l.length < 50 && !l.includes('@') && !l.includes('+') && !l.includes('http') && !l.includes('github') && !l.includes('linkedin')) {
      if (/developer|engineer|manager|director|doctor|physician|nurse|teacher|analyst|designer|consultant|specialist|officer|lead|architect/i.test(l)) {
        professionalTitle = l;
        break;
      }
    }
  }

  // 7. Location
  let location = '';
  const locMatch = text.match(/(?:Location|Address)?:\s*([A-Za-z\s]+,\s*[A-Z]{2,}(?:\s+\d{5})?|[A-Za-z\s]+,\s*[A-Za-z]+)/i);
  if (locMatch) {
    location = locMatch[1].trim();
  }

  // 8. Summary Parsing
  let professionalSummary = '';
  const sumIdx = lines.findIndex(l => /^(professional summary|summary|about me|profile|executive summary|objective)/i.test(l));
  if (sumIdx !== -1) {
    const sumLines = lines.slice(sumIdx + 1, sumIdx + 6).filter(l => !/^(experience|education|skills|projects)/i.test(l));
    professionalSummary = sumLines.join(' ');
  }

  // 9. Multi-Experience Parsing
  const experience: WorkExperienceItem[] = [];
  const expIndex = lines.findIndex(l => /^(work experience|professional experience|experience|employment history|career history)/i.test(l));
  const eduIndex = lines.findIndex(l => /^(education|academic background|qualifications)/i.test(l));
  const skillsIndex = lines.findIndex(l => /^(skills|core competencies|technical skills|key skills)/i.test(l));
  const projIndex = lines.findIndex(l => /^(projects|key projects|personal projects)/i.test(l));

  if (expIndex !== -1) {
    const endExp = eduIndex > expIndex ? eduIndex : (skillsIndex > expIndex ? skillsIndex : (projIndex > expIndex ? projIndex : lines.length));
    const expLines = lines.slice(expIndex + 1, endExp);

    let currentExp: Partial<WorkExperienceItem> | null = null;
    let achievements: string[] = [];

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      // Detect date ranges like "2020 - 2023", "Mar 2021 - Present"
      const dateMatch = line.match(/(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}\s*[-–—to]+\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}|Present|Current)/i);
      
      if (dateMatch || (/^[A-Z][a-zA-Z\s]{3,35}\s+(?:at|—|\||-)\s+[A-Za-z0-9\s]{2,40}/i.test(line) && !line.startsWith('•') && !line.startsWith('-'))) {
        // Save previous
        if (currentExp && (currentExp.jobTitle || currentExp.company)) {
          experience.push({
            id: `exp-imp-${experience.length + 1}`,
            jobTitle: currentExp.jobTitle || 'Role Title',
            company: currentExp.company || 'Company Name',
            location: currentExp.location || '',
            employmentType: 'Full-time',
            startDate: currentExp.startDate || '2021',
            endDate: currentExp.endDate || 'Present',
            isCurrent: currentExp.endDate?.toLowerCase().includes('present') || currentExp.endDate?.toLowerCase().includes('current') || false,
            responsibilities: currentExp.responsibilities || '',
            achievements: achievements.join('\n') || '• Delivered core team milestones and optimized operational workflows.',
          });
          achievements = [];
        }

        const dateParts = dateMatch ? dateMatch[0].split(/[-–—to]+/).map(s => s.trim()) : [];
        const cleanTitleLine = dateMatch ? line.replace(dateMatch[0], '').replace(/[()|]/g, '').trim() : line;
        const [jobTitle, company] = cleanTitleLine.split(/(?:\s+(?:at|—|\||-)\s+)/i);

        currentExp = {
          jobTitle: (jobTitle || cleanTitleLine).trim(),
          company: (company || 'Company Name').trim(),
          startDate: dateParts[0] || '',
          endDate: dateParts[1] || 'Present',
        };
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        achievements.push(line);
      } else if (currentExp && !currentExp.responsibilities && line.length > 20) {
        currentExp.responsibilities = line;
      }
    }

    // Push final experience item
    if (currentExp && (currentExp.jobTitle || currentExp.company)) {
      experience.push({
        id: `exp-imp-${experience.length + 1}`,
        jobTitle: currentExp.jobTitle || 'Role Title',
        company: currentExp.company || 'Company Name',
        location: currentExp.location || '',
        employmentType: 'Full-time',
        startDate: currentExp.startDate || '2021',
        endDate: currentExp.endDate || 'Present',
        isCurrent: currentExp.endDate?.toLowerCase().includes('present') || currentExp.endDate?.toLowerCase().includes('current') || false,
        responsibilities: currentExp.responsibilities || '',
        achievements: achievements.join('\n') || '• Delivered high-impact deliverables meeting project objectives.',
      });
    }
  }

  // 10. Education Parsing
  const education: EducationItem[] = [];
  if (eduIndex !== -1) {
    const endEdu = skillsIndex > eduIndex ? skillsIndex : (projIndex > eduIndex ? projIndex : lines.length);
    const eduLines = lines.slice(eduIndex + 1, endEdu);

    for (let i = 0; i < eduLines.length; i++) {
      const line = eduLines[i];
      if (/degree|bachelor|master|phd|doctorate|b\.s|m\.s|b\.a|m\.a|mba|associate|diploma|university|college|school|institute/i.test(line)) {
        const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/g);
        const startYear = yearMatch ? yearMatch[0] : '';
        const endYear = yearMatch && yearMatch.length > 1 ? yearMatch[1] : (yearMatch ? yearMatch[0] : '');

        education.push({
          id: `edu-imp-${education.length + 1}`,
          degree: line.split(/(?:at|—|,)/)[0]?.trim() || 'Degree / Qualification',
          institution: line.split(/(?:at|—|,)/)[1]?.trim() || 'University / Institution',
          fieldOfStudy: '',
          location: '',
          startYear: startYear,
          graduationYear: endYear,
          description: '',
        });
      }
    }
  }

  // 11. Skills Parsing
  const detectedSkills: string[] = [];
  if (skillsIndex !== -1) {
    const endSkills = projIndex > skillsIndex ? projIndex : lines.length;
    const skillLines = lines.slice(skillsIndex + 1, Math.min(skillsIndex + 12, endSkills));
    skillLines.forEach(l => {
      const parts = l.split(/[,•|;]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 35);
      detectedSkills.push(...parts);
    });
  }

  // If no skills found in skills section, search for known keywords in the entire text
  if (detectedSkills.length === 0) {
    const knownSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'PostgreSQL',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML5', 'CSS3', 'REST APIs', 'GraphQL', 'Agile',
      'Scrum', 'Leadership', 'Project Management', 'Data Analysis', 'Figma', 'Excel', 'Communication'
    ];
    knownSkills.forEach(s => {
      const reg = new RegExp(`\\b${s}\\b`, 'i');
      if (reg.test(text)) {
        detectedSkills.push(s);
      }
    });
  }

  // 12. Projects Parsing
  const projects: ProjectItem[] = [];
  if (projIndex !== -1) {
    const projLines = lines.slice(projIndex + 1, Math.min(projIndex + 12, lines.length));
    for (let i = 0; i < projLines.length; i++) {
      const l = projLines[i];
      if (l.length > 5 && l.length < 50 && !l.startsWith('•') && !l.startsWith('-')) {
        projects.push({
          id: `proj-imp-${projects.length + 1}`,
          title: l,
          description: projLines[i + 1] || 'Key project delivering scalable architecture.',
          technologies: [],
        });
      }
    }
  }

  return {
    personal: {
      ...INITIAL_RESUME.personal,
      fullName: fullName || INITIAL_RESUME.personal.fullName,
      professionalTitle: professionalTitle || INITIAL_RESUME.personal.professionalTitle,
      email: email || INITIAL_RESUME.personal.email,
      phone: phone || INITIAL_RESUME.personal.phone,
      location: location || INITIAL_RESUME.personal.location,
      linkedin: linkedin || INITIAL_RESUME.personal.linkedin,
      website: website || INITIAL_RESUME.personal.website,
    },
    summary: {
      professionalSummary: professionalSummary || (lines.length > 2 && !lines[2].includes('@') ? lines.slice(2, 5).join(' ') : INITIAL_RESUME.summary.professionalSummary),
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
    additional: {
      ...INITIAL_RESUME.additional,
      projects: projects.length > 0 ? projects : INITIAL_RESUME.additional.projects,
    },
  };
}
