export interface PersonalDetails {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  website: string;
  photoUrl?: string;
  photoShape: 'circle' | 'square' | 'rounded';
  photoSize: number; // in px: 70 - 130
  photoPosition: 'left' | 'center' | 'right' | 'sidebar';
}

export interface SummaryData {
  professionalSummary: string;
  careerObjective: string;
  careerHighlights: string[];
}

export interface WorkExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  achievements: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  location: string;
  startYear: string;
  graduationYear: string;
  gpa?: string;
  description?: string;
}

export interface SkillsData {
  technical: string[];
  professional: string[];
  soft: string[];
  industrySpecific: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

export interface InternshipItem {
  id: string;
  role: string;
  organization: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  institution?: string;
  date?: string;
  description: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic';
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  cause?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface MembershipItem {
  id: string;
  organization: string;
  role?: string;
  year?: string;
}

export interface LicenseItem {
  id: string;
  name: string;
  issuingAuthority: string;
  licenseNumber?: string;
  validUntil?: string;
}

export interface CourseItem {
  id: string;
  name: string;
  institution: string;
  completionDate?: string;
}

export interface TrainingItem {
  id: string;
  program: string;
  provider: string;
  year?: string;
}

export interface LeadershipItem {
  id: string;
  role: string;
  organization: string;
  highlights?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  company: string;
  position: string;
  contact: string;
  email?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface AdditionalSections {
  projects: ProjectItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  internships: InternshipItem[];
  publications: PublicationItem[];
  research: ResearchItem[];
  languages: LanguageItem[];
  volunteerWork: VolunteerItem[];
  memberships: MembershipItem[];
  licenses: LicenseItem[];
  courses: CourseItem[];
  training: TrainingItem[];
  leadership: LeadershipItem[];
  achievements: AchievementItem[];
  references: ReferenceItem[];
  customSections: CustomSection[];
}

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'internships'
  | 'publications'
  | 'research'
  | 'languages'
  | 'volunteerWork'
  | 'memberships'
  | 'licenses'
  | 'courses'
  | 'training'
  | 'leadership'
  | 'achievements'
  | 'references'
  | string; // for custom sections

export interface ColorScheme {
  primary: string; // Accent color
  headings: string;
  bodyText: string;
  background: string;
  divider: string;
  sectionHighlight: string;
  sidebar: string;
}

export interface TypographySettings {
  fontFamily: string;
  nameFont: string;
  headingFont: string;
  bodyFont: string;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'normal' | 'medium' | 'bold';
  lineSpacing: 'tight' | 'normal' | 'relaxed';
  letterSpacing: 'tight' | 'normal' | 'wide';
  textAlignment: 'left' | 'center' | 'justify';
}

export interface LayoutSettings {
  layoutType: 'single' | 'two-column' | 'sidebar-left' | 'sidebar-right';
  sidebarWidth: number; // percentage, e.g. 33
  margins: 'compact' | 'normal' | 'spacious';
  pagePadding: 'compact' | 'normal' | 'spacious';
  bulletStyle: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'diamond';
  dividerStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient' | 'none';
  sectionHeadingStyle: 'clean' | 'underlined' | 'filled' | 'pill' | 'bordered' | 'uppercase-accent' | 'left-bar';
}

export interface PageSettings {
  pageSize: 'A4' | 'Letter';
  maxPages: '1-page' | '2-page' | 'auto';
  showPageNumbers: boolean;
}

export interface DesignSettings {
  templateId: string;
  colorScheme: ColorScheme;
  typography: TypographySettings;
  layout: LayoutSettings;
  pageSettings: PageSettings;
}

export interface ResumeData {
  id: string;
  title: string;
  targetRole?: string;
  lastModified: number;
  personal: PersonalDetails;
  summary: SummaryData;
  experience: WorkExperienceItem[];
  education: EducationItem[];
  skills: SkillsData;
  additional: AdditionalSections;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  design: DesignSettings;
}

export type ProfessionCategory =
  | 'Technology'
  | 'Engineering'
  | 'Marketing & Creative'
  | 'Finance & Accounting'
  | 'Healthcare & Medical'
  | 'Education & Academia'
  | 'Management & Executive'
  | 'Legal & Compliance'
  | 'Hospitality & Retail'
  | 'Fresher & Student'
  | 'General';
