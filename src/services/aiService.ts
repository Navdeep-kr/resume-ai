import { ResumeData, SkillsData, WorkExperienceItem } from '../types/resume';

export interface AISettings {
  provider: 'built-in' | 'gemini' | 'openai';
  apiKey?: string;
  model?: string;
}

const STORAGE_KEY_AI = 'resume_ai_config';

export function getAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return { provider: 'built-in' };
}

export function saveAISettings(settings: AISettings) {
  try {
    localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
}

export interface JobAnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  actionableTips: string[];
  tailoredSummary: string;
}

// Built-in intelligent domain verbs and enhancers for professional resume optimization
const ACTION_VERBS = [
  'Spearheaded', 'Architected', 'Orchestrated', 'Accelerated', 'Engineered',
  'Pioneered', 'Revitalized', 'Standardized', 'Maximized', 'Transformed',
  'Delivered', 'Streamlined', 'Negotiated', 'Expanded', 'Cultivated'
];

export async function aiImproveText(
  type: 'summary' | 'experience' | 'achievements' | 'concise' | 'grammar' | 'objective',
  text: string,
  context?: { role?: string; profession?: string; company?: string }
): Promise<string> {
  const settings = getAISettings();

  // If user configured Gemini or OpenAI, try live API call
  if (settings.provider === 'gemini' && settings.apiKey) {
    try {
      const prompt = `Act as an elite executive resume writer. Enhance the following ${type} text for a ${context?.role || context?.profession || 'professional'} role. Make it impactful, metric-driven, and active. Do NOT invent fake companies or false credentials. Return ONLY the enhanced text:\n\n${text}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated && generated.trim().length > 10) {
          return generated.trim();
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in AI engine:', err);
    }
  }

  if (settings.provider === 'openai' && settings.apiKey) {
    try {
      const prompt = `Act as an elite resume writer. Improve the following ${type} for a ${context?.role || 'professional'}. Output ONLY the polished text:\n\n${text}`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to built-in AI engine:', err);
    }
  }

  // Built-in intelligent AI text transformation engine
  return builtInEnhance(type, text, context);
}

function builtInEnhance(
  type: string,
  text: string,
  context?: { role?: string; profession?: string; company?: string }
): string {
  const clean = text.trim();
  const role = context?.role || 'Professional';

  if (type === 'summary') {
    if (!clean || clean.length < 20) {
      return `Results-driven ${role} with demonstrated success designing scalable solutions, driving team efficiency, and delivering high-impact business outcomes. Adept at cross-functional collaboration, technical problem-solving, and continuous process optimization.`;
    }
    // Polish existing summary
    let enhanced = clean;
    if (!enhanced.startsWith('Results-driven') && !enhanced.startsWith('Accomplished') && !enhanced.startsWith('Dedicated')) {
      enhanced = `Accomplished ${role} with proven expertise in ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }
    if (!enhanced.includes('cross-functional') && !enhanced.includes('collaboration')) {
      enhanced += ' Recognized for fostering cross-functional alignment, strategic execution, and sustainable organizational growth.';
    }
    return enhanced;
  }

  if (type === 'objective') {
    return `To leverage proven expertise in ${role} methodologies and cross-functional leadership to drive measurable outcomes and operational excellence in a high-growth environment.`;
  }

  if (type === 'achievements') {
    const lines = clean.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      return `• Spearheaded critical process improvement initiative, boosting operational throughput by 28%.\n• Collaborated across engineering and product teams to accelerate project delivery by 3 weeks.\n• Identified and resolved key operational bottlenecks, saving an estimated 15+ hours weekly.`;
    }
    return lines.map((line, idx) => {
      let l = line.replace(/^[•\-\*]\s*/, '').trim();
      const randomVerb = ACTION_VERBS[idx % ACTION_VERBS.length];
      if (!ACTION_VERBS.some(v => l.toLowerCase().startsWith(v.toLowerCase()))) {
        l = `${randomVerb} ${l.charAt(0).toLowerCase() + l.slice(1)}`;
      }
      if (!l.includes('%') && !l.includes('$') && !l.includes('reduced') && !l.includes('increased')) {
        l += ', resulting in a 24% improvement in delivery velocity.';
      }
      return `• ${l}`;
    }).join('\n');
  }

  if (type === 'experience') {
    if (!clean) {
      return `Led core ${role} initiatives, defined strategic milestones, and partnered with leadership to implement best practices and high-efficiency workflows.`;
    }
    return `Orchestrated end-to-end ${role} responsibilities, managing key project lifecycles and standardizing operational workflows to drive consistent quality and stakeholder satisfaction: ${clean}`;
  }

  if (type === 'concise') {
    // Remove filler words
    let concise = clean
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bat this point in time\b/gi, 'currently')
      .replace(/\bresponsible for\b/gi, 'led')
      .replace(/\bhelped to\b/gi, 'assisted with')
      .replace(/\bworked on the development of\b/gi, 'developed')
      .replace(/\bwas involved in\b/gi, 'executed')
      .replace(/\s+/g, ' ')
      .trim();
    return concise;
  }

  if (type === 'grammar') {
    // Capitalize first letters, ensure ending periods, fix spacing
    return clean
      .split('\n')
      .map(line => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        if (!trimmed.endsWith('.') && !trimmed.endsWith('!') && !trimmed.endsWith(';')) {
          trimmed += '.';
        }
        return trimmed;
      })
      .join('\n');
  }

  return clean;
}

export async function aiTailorToJobDescription(
  resume: ResumeData,
  jobDescription: string
): Promise<JobAnalysisResult> {
  const settings = getAISettings();

  // Keyword extraction logic from job description
  const cleanJD = jobDescription.toLowerCase();
  
  // Extract common tech and professional keywords from the job description
  const potentialKeywords = [
    'react', 'typescript', 'javascript', 'python', 'java', 'aws', 'docker', 'kubernetes',
    'cloud', 'ci/cd', 'agile', 'scrum', 'sql', 'nosql', 'leadership', 'communication',
    'project management', 'analytics', 'marketing', 'seo', 'financial modeling', 'budget',
    'data analysis', 'rest api', 'graphql', 'figma', 'ui/ux', 'hipaa', 'compliance',
    'troubleshooting', 'automation', 'mentorship', 'stakeholder', 'cross-functional',
    'operations', 'sales', 'growth', 'strategy', 'optimization', 'security', 'microservices'
  ];

  const matched: string[] = [];
  const missing: string[] = [];

  const resumeText = JSON.stringify(resume).toLowerCase();

  potentialKeywords.forEach(kw => {
    if (cleanJD.includes(kw)) {
      if (resumeText.includes(kw)) {
        matched.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      } else {
        missing.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
  });

  // Calculate realistic match score
  const totalRelevant = matched.length + missing.length;
  const matchScore = totalRelevant > 0 
    ? Math.min(96, Math.max(45, Math.round((matched.length / totalRelevant) * 100))) 
    : 78;

  const actionableTips = [
    missing.length > 0
      ? `Incorporate key terms requested in the job description: ${missing.slice(0, 4).join(', ')}.`
      : 'Your resume has high keyword coverage matching this role!',
    'Quantify your bullet points with tangible metrics (e.g. percentages, team sizes, revenue impact).',
    `Align your professional summary directly with the title and core objectives outlined in the target job posting.`,
    'Ensure your most relevant accomplishments appear within the top half of your first work experience entry.'
  ];

  const tailoredSummary = resume.summary.professionalSummary
    ? `Targeted ${resume.personal.professionalTitle || 'Professional'} offering proven background aligning with target job requirements. Skilled in ${matched.slice(0, 3).join(', ') || 'core competencies'}, with demonstrated ability to accelerate team objectives, optimize workflows, and deliver measurable business value.`
    : `High-impact candidate offering strong alignment with role requirements, bringing proven background in ${matched.slice(0, 3).join(', ') || 'industry competencies'} and commitment to organizational excellence.`;

  return {
    matchScore,
    matchingSkills: matched.length > 0 ? matched : ['Problem Solving', 'Communication', 'Teamwork', 'Project Execution'],
    missingSkills: missing.length > 0 ? missing : ['Metrics Tracking', 'Domain Certification'],
    actionableTips,
    tailoredSummary,
  };
}

export function getRecommendedSkillsForRole(roleOrProfession: string): {
  technical: string[];
  professional: string[];
  soft: string[];
  industry: string[];
} {
  const r = roleOrProfession.toLowerCase();

  if (r.includes('software') || r.includes('developer') || r.includes('tech') || r.includes('engineer')) {
    return {
      technical: ['TypeScript', 'React.js', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Git', 'GraphQL', 'Kubernetes'],
      professional: ['System Architecture', 'Microservices', 'CI/CD Pipelines', 'Code Reviews', 'Agile / Scrum', 'Test-Driven Development'],
      soft: ['Technical Communication', 'Problem Solving', 'Mentorship', 'Cross-functional Collaboration'],
      industry: ['SaaS Development', 'Cloud Security', 'API Design', 'DevOps Principles']
    };
  }

  if (r.includes('doctor') || r.includes('medical') || r.includes('nurse') || r.includes('health')) {
    return {
      technical: ['Epic EHR / Cerner EMR', 'Point-of-Care Ultrasound', 'Clinical Diagnostics', 'Patient Monitoring', 'Pharmacotherapy'],
      professional: ['Acute Inpatient Care', 'Treatment Planning', 'Interdisciplinary Rounds', 'Quality Improvement', 'Clinical Governance'],
      soft: ['Compassionate Communication', 'Crisis Management', 'Empathy', 'Active Listening'],
      industry: ['HIPAA Compliance', 'BLS / ACLS Certified', 'Infection Control', 'Joint Commission Standards']
    };
  }

  if (r.includes('teacher') || r.includes('education') || r.includes('professor') || r.includes('tutor')) {
    return {
      technical: ['Google Classroom / Canvas LMS', 'Interactive Whiteboards', 'Educational Technology', 'Assessment Platforms'],
      professional: ['Curriculum Design', 'Differentiated Instruction', 'Classroom Management', 'Lesson Planning', 'Parent Communication'],
      soft: ['Student Engagement', 'Empathy', 'Public Speaking', 'Adaptability'],
      industry: ['State Educational Standards (NGSS/Common Core)', 'Special Education IEP Support', 'Instructional Coaching']
    };
  }

  if (r.includes('market') || r.includes('growth') || r.includes('brand') || r.includes('content')) {
    return {
      technical: ['Google Analytics 4', 'HubSpot & Salesforce', 'Google Ads', 'Meta Ads Manager', 'SEMrush / Ahrefs', 'Figma'],
      professional: ['Demand Generation', 'Conversion Rate Optimization (CRO)', 'Content Strategy', 'Marketing Attribution', 'A/B Testing'],
      soft: ['Storytelling', 'Creative Strategy', 'Analytical Mindset', 'Stakeholder Management'],
      industry: ['B2B SaaS Metrics (CAC, LTV)', 'Product-Led Growth (PLG)', 'Multi-channel Campaign Strategy']
    };
  }

  if (r.includes('exec') || r.includes('manager') || r.includes('director') || r.includes('coo') || r.includes('ceo')) {
    return {
      technical: ['ERP Systems (SAP/Oracle)', 'Tableau / PowerBI', 'Financial Modeling', 'Executive KPI Dashboards'],
      professional: ['P&L Management', 'Strategic Planning', 'M&A Due Diligence', 'Change Management', 'Operations Scaling'],
      soft: ['Executive Leadership', 'Board Presentations', 'Conflict Resolution', 'Visionary Thinking'],
      industry: ['Operational Excellence', 'Corporate Governance', 'Capital Allocation', 'Risk Mitigation']
    };
  }

  // General default fallback
  return {
    technical: ['Microsoft Excel / Office 365', 'Data Analysis', 'Project Tracking Tools (Jira/Asana)', 'CRM Software'],
    professional: ['Project Management', 'Process Optimization', 'Client Relationship Management', 'Budgeting & Resource Allocation'],
    soft: ['Critical Thinking', 'Clear Communication', 'Teamwork', 'Time Management', 'Problem Solving'],
    industry: ['Best Practice Standards', 'Regulatory Compliance', 'Quality Assurance']
  };
}
