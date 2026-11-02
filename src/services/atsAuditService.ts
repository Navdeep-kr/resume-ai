import { ResumeData } from '../types/resume';

export interface AtsCheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  weight: number;
}

export interface AtsAuditReport {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Work';
  summary: string;
  checks: AtsCheckItem[];
  powerVerbsFound: string[];
  weakWordsFound: string[];
  metricsCount: number;
  wordCount: number;
  actionableImprovements: string[];
}

const POWER_ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'coached', 'collaborated', 'conducted', 'consolidated',
  'created', 'decreased', 'delivered', 'deployed', 'designed', 'developed',
  'directed', 'drove', 'engineered', 'established', 'evaluated', 'exceeded',
  'expanded', 'expedited', 'formulated', 'generated', 'guided', 'implemented',
  'improved', 'increased', 'initiated', 'instituted', 'integrated', 'launched',
  'led', 'managed', 'maximized', 'mentored', 'minimized', 'modernized',
  'negotiated', 'optimized', 'orchestrated', 'overhauled', 'partnered',
  'pioneered', 'planned', 'reduced', 're-engineered', 'resolved', 'restructured',
  'revitalized', 'scaled', 'slashed', 'spearheaded', 'standardized', 'streamlined',
  'strengthened', 'structured', 'surpassed', 'trained', 'transformed', 'upgraded'
];

const WEAK_PASSIVE_WORDS = [
  'responsible for', 'helped with', 'worked on', 'assisted in', 'handled',
  'was involved in', 'duties included', 'tried to', 'attempted', 'supported the',
  'part of a team that', 'participated in'
];

export function auditResumeForAts(resume: ResumeData): AtsAuditReport {
  const checks: AtsCheckItem[] = [];
  const actionableImprovements: string[] = [];

  const rawJson = JSON.stringify(resume).toLowerCase();
  const allText = [
    resume.personal.fullName,
    resume.personal.professionalTitle,
    resume.summary.professionalSummary,
    resume.summary.careerObjective,
    ...(resume.experience || []).map(e => `${e.jobTitle} ${e.company} ${e.responsibilities} ${e.achievements}`),
    ...(resume.education || []).map(ed => `${ed.degree} ${ed.institution} ${ed.description}`),
    ...(resume.skills.technical || []),
    ...(resume.skills.professional || []),
    ...(resume.skills.soft || []),
  ].join(' ');

  const words = allText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Contact Details Check
  const hasName = Boolean(resume.personal.fullName?.trim());
  const hasEmail = Boolean(resume.personal.email?.trim() && resume.personal.email.includes('@'));
  const hasPhone = Boolean(resume.personal.phone?.trim());
  const hasLinkedIn = Boolean(resume.personal.linkedin?.trim());
  const hasLocation = Boolean(resume.personal.location?.trim());

  if (hasName && hasEmail && hasPhone) {
    checks.push({
      id: 'contact',
      label: 'Core Contact Details',
      status: 'pass',
      detail: 'Name, email, and phone number are properly formatted for ATS parsing.',
      weight: 15,
    });
  } else {
    checks.push({
      id: 'contact',
      label: 'Core Contact Details',
      status: 'fail',
      detail: 'Missing required contact info (Name, valid Email, or Phone).',
      weight: 15,
    });
    actionableImprovements.push('Add a valid email and phone number to your contact section.');
  }

  // LinkedIn check
  if (hasLinkedIn) {
    checks.push({
      id: 'linkedin',
      label: 'Professional Profile Link',
      status: 'pass',
      detail: 'LinkedIn profile is included.',
      weight: 5,
    });
  } else {
    checks.push({
      id: 'linkedin',
      label: 'Professional Profile Link',
      status: 'warning',
      detail: 'Adding a LinkedIn profile increases recruiter response rates by up to 40%.',
      weight: 5,
    });
    actionableImprovements.push('Add your LinkedIn profile URL in personal details.');
  }

  // 2. Professional Summary
  const summaryLength = resume.summary.professionalSummary?.trim().split(/\s+/).filter(Boolean).length || 0;
  if (summaryLength >= 25 && summaryLength <= 120) {
    checks.push({
      id: 'summary',
      label: 'Professional Summary',
      status: 'pass',
      detail: `Optimal length (${summaryLength} words). Clear and focused overview.`,
      weight: 15,
    });
  } else if (summaryLength > 0 && summaryLength < 25) {
    checks.push({
      id: 'summary',
      label: 'Professional Summary',
      status: 'warning',
      detail: `Summary is brief (${summaryLength} words). Consider adding your core specializations.`,
      weight: 15,
    });
    actionableImprovements.push('Expand your professional summary to 3-4 impactful sentences.');
  } else if (summaryLength === 0) {
    checks.push({
      id: 'summary',
      label: 'Professional Summary',
      status: 'warning',
      detail: 'A strong 3-4 sentence professional summary helps ATS match role keywords.',
      weight: 15,
    });
    actionableImprovements.push('Add a professional summary highlighting your domain experience.');
  } else {
    checks.push({
      id: 'summary',
      label: 'Professional Summary',
      status: 'warning',
      detail: `Summary is long (${summaryLength} words). Aim for under 100 words to maintain attention.`,
      weight: 15,
    });
  }

  // 3. Work Experience & Quantifiable Metrics
  const experienceCount = resume.experience?.length || 0;
  let totalBullets = 0;
  let metricsBulletsCount = 0;
  const powerVerbsFound: string[] = [];
  const weakWordsFound: string[] = [];

  // Check metrics regex: numbers, %, $, k, M, hours, times
  const metricRegex = /(\b\d+([.,]\d+)?%|\$\s*\d+([.,]\d+)?[kKmMbB]?|\b\d+x\b|\b\d+\s*(?:percent|million|billion|thousand|users|clients|hours|days|weeks|months|years|members|teams|engineers|people)\b|\b\d{2,}\b)/i;

  (resume.experience || []).forEach(exp => {
    const text = `${exp.responsibilities}\n${exp.achievements}`;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    totalBullets += lines.length;

    lines.forEach(line => {
      if (metricRegex.test(line)) {
        metricsBulletsCount++;
      }
    });
  });

  // Check power verbs
  POWER_ACTION_VERBS.forEach(verb => {
    const reg = new RegExp(`\\b${verb}\\b`, 'i');
    if (reg.test(allText)) {
      powerVerbsFound.push(verb.charAt(0).toUpperCase() + verb.slice(1));
    }
  });

  // Check weak words
  WEAK_PASSIVE_WORDS.forEach(weak => {
    if (allText.toLowerCase().includes(weak)) {
      weakWordsFound.push(weak);
    }
  });

  if (experienceCount >= 1) {
    if (metricsBulletsCount >= 3) {
      checks.push({
        id: 'metrics',
        label: 'Quantifiable Results & Metrics',
        status: 'pass',
        detail: `Found ${metricsBulletsCount} bullet points with measurable data (%, $, numbers). Excellent!`,
        weight: 20,
      });
    } else {
      checks.push({
        id: 'metrics',
        label: 'Quantifiable Results & Metrics',
        status: 'warning',
        detail: `Found ${metricsBulletsCount} metrics. Hiring managers favor numbers, revenue impact, or percentages.`,
        weight: 20,
      });
      actionableImprovements.push('Add measurable outcomes (e.g. "reduced latency by 40%", "managed $2M budget").');
    }
  } else {
    // If fresher with no experience, projects check
    const projectCount = resume.additional?.projects?.length || 0;
    if (projectCount >= 1) {
      checks.push({
        id: 'projects_fresher',
        label: 'Projects (Entry-Level Track)',
        status: 'pass',
        detail: `Found ${projectCount} portfolio projects substituting for work experience.`,
        weight: 20,
      });
    } else {
      checks.push({
        id: 'experience',
        label: 'Work Experience or Projects',
        status: 'warning',
        detail: 'Add work experience or key projects to prove practical skills.',
        weight: 20,
      });
      actionableImprovements.push('Add at least 1-2 work experiences or academic/personal projects.');
    }
  }

  // 4. Action Verbs Check
  if (powerVerbsFound.length >= 4) {
    checks.push({
      id: 'verbs',
      label: 'High-Impact Action Verbs',
      status: 'pass',
      detail: `Detected ${powerVerbsFound.length} strong action verbs (${powerVerbsFound.slice(0, 4).join(', ')}...).`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'verbs',
      label: 'High-Impact Action Verbs',
      status: 'warning',
      detail: `Detected ${powerVerbsFound.length} power verbs. Start bullets with words like Spearheaded, Engineered, Delivered.`,
      weight: 15,
    });
    actionableImprovements.push('Start bullet points with strong active verbs instead of passive phrases.');
  }

  // Passive words penalty check
  if (weakWordsFound.length > 0) {
    actionableImprovements.push(`Replace weak phrases like "${weakWordsFound[0]}" with punchy action verbs.`);
  }

  // 5. Skills Section Check
  const totalSkills = (resume.skills.technical?.length || 0) + 
                      (resume.skills.professional?.length || 0) + 
                      (resume.skills.soft?.length || 0) + 
                      (resume.skills.industrySpecific?.length || 0);

  if (totalSkills >= 8) {
    checks.push({
      id: 'skills',
      label: 'Skills Keywords Coverage',
      status: 'pass',
      detail: `Strong skills density (${totalSkills} skills across technical and professional categories).`,
      weight: 15,
    });
  } else if (totalSkills >= 4) {
    checks.push({
      id: 'skills',
      label: 'Skills Keywords Coverage',
      status: 'warning',
      detail: `Contains ${totalSkills} skills. Expanding to 8-12 relevant skills improves ATS match rates.`,
      weight: 15,
    });
    actionableImprovements.push('Add 4-5 more industry or technical skills in Section E.');
  } else {
    checks.push({
      id: 'skills',
      label: 'Skills Keywords Coverage',
      status: 'fail',
      detail: 'Skills section is too sparse for automated recruiter keyword filters.',
      weight: 15,
    });
    actionableImprovements.push('Add your technical and professional tools into the Skills section.');
  }

  // 6. Education Check
  const educationCount = resume.education?.length || 0;
  if (educationCount >= 1) {
    checks.push({
      id: 'education',
      label: 'Education & Credentials',
      status: 'pass',
      detail: `${educationCount} degree/institution listed correctly.`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'education',
      label: 'Education & Credentials',
      status: 'warning',
      detail: 'Adding higher education or certificates validates credentials for recruiters.',
      weight: 15,
    });
    actionableImprovements.push('Include your degree, diploma, or relevant academic qualifications.');
  }

  // Calculate Weighted Score
  let earnedScore = 0;
  let totalWeight = 0;

  checks.forEach(c => {
    totalWeight += c.weight;
    if (c.status === 'pass') earnedScore += c.weight;
    if (c.status === 'warning') earnedScore += c.weight * 0.65;
  });

  const finalScore = Math.min(100, Math.max(30, Math.round((earnedScore / totalWeight) * 100)));

  let grade: AtsAuditReport['grade'] = 'Needs Work';
  if (finalScore >= 90) grade = 'A+';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 55) grade = 'C';

  let summary = '';
  if (finalScore >= 90) {
    summary = 'Outstanding! Your resume has high keyword coverage, strong action verbs, and clean ATS-compliant structure.';
  } else if (finalScore >= 80) {
    summary = 'Strong competitive resume. A few extra quantifiable metrics will make it standout to elite employers.';
  } else if (finalScore >= 70) {
    summary = 'Good foundation. Review the recommended improvements below to pass top ATS candidate filters.';
  } else {
    summary = 'Needs enhancement. Focus on adding quantifiable results, skills keywords, and power verbs.';
  }

  return {
    score: finalScore,
    grade,
    summary,
    checks,
    powerVerbsFound: Array.from(new Set(powerVerbsFound)),
    weakWordsFound: Array.from(new Set(weakWordsFound)),
    metricsCount: metricsBulletsCount,
    wordCount,
    actionableImprovements: Array.from(new Set(actionableImprovements)).slice(0, 4),
  };
}
