import React from 'react';
import { ResumeData, SectionKey } from '../../types/resume';
import { 
  Mail, Phone, MapPin, Globe, ExternalLink, Calendar, 
  Award, BookOpen, Briefcase, GraduationCap, Code, CheckCircle2, User
} from 'lucide-react';
import { LinkedInIcon } from '../common/Icons';

interface ResumeDocumentProps {
  resume: ResumeData;
  scale?: number;
  isPrintMode?: boolean;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  scale = 1,
  isPrintMode = false,
}) => {
  const { personal, summary, experience, education, skills, additional, design, sectionOrder, hiddenSections } = resume;
  const { colorScheme, typography, layout, pageSettings, templateId } = design;

  // Determine active font families
  const fontFamilyStyle = {
    fontFamily: typography.fontFamily || 'Inter, sans-serif',
    color: colorScheme.bodyText || '#334155',
  };

  // Dimensions
  const isA4 = pageSettings.pageSize === 'A4';
  // A4 ratio: 210mm x 297mm (1:1.414). In px at 96 DPI: ~794px x ~1123px.
  // Letter ratio: 8.5in x 11in. In px at 96 DPI: ~816px x ~1056px.
  const baseWidthPx = isA4 ? 794 : 816;
  const minHeightPx = isA4 ? 1123 : 1056;

  // Padding & Margin scale
  const paddingMap = {
    compact: 'p-6 sm:p-8',
    normal: 'p-8 sm:p-12',
    spacious: 'p-10 sm:p-14',
  };

  const lineSpacingMap = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  };

  const letterSpacingMap = {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wider',
  };

  const fontSizeMap = {
    small: 'text-[13px]',
    medium: 'text-[14px]',
    large: 'text-[15px]',
  };

  const headingSizeMap = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  const nameSizeMap = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  // Bullet style helper
  const renderBulletIcon = () => {
    switch (layout.bulletStyle) {
      case 'square':
        return <span className="inline-block w-1.5 h-1.5 mr-2 mt-1.5 rounded-none flex-shrink-0" style={{ backgroundColor: colorScheme.primary }} />;
      case 'circle':
        return <span className="inline-block w-1.5 h-1.5 mr-2 mt-1.5 rounded-full border flex-shrink-0" style={{ borderColor: colorScheme.primary }} />;
      case 'dash':
        return <span className="inline-block mr-2 font-bold select-none" style={{ color: colorScheme.primary }}>—</span>;
      case 'arrow':
        return <span className="inline-block mr-2 font-bold select-none" style={{ color: colorScheme.primary }}>▸</span>;
      case 'diamond':
        return <span className="inline-block mr-2 font-bold select-none text-[10px]" style={{ color: colorScheme.primary }}>◆</span>;
      case 'disc':
      default:
        return <span className="inline-block w-1.5 h-1.5 mr-2 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorScheme.primary }} />;
    }
  };

  // Section Heading Formatter
  const renderSectionHeading = (title: string, icon?: React.ReactNode) => {
    const headingStyle = layout.sectionHeadingStyle || 'underlined';
    const fontStyle = {
      fontFamily: typography.headingFont || typography.fontFamily,
      letterSpacing: typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
    };

    if (headingStyle === 'filled') {
      return (
        <div 
          className="px-3 py-1.5 rounded mb-3 flex items-center gap-2 font-semibold text-white uppercase text-xs tracking-wider"
          style={{ backgroundColor: colorScheme.primary, ...fontStyle }}
        >
          {icon}
          <span>{title}</span>
        </div>
      );
    }

    if (headingStyle === 'pill') {
      return (
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            style={{ 
              backgroundColor: colorScheme.sectionHighlight || '#f1f5f9',
              color: colorScheme.primary,
              ...fontStyle
            }}
          >
            {icon}
            {title}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: colorScheme.divider }} />
        </div>
      );
    }

    if (headingStyle === 'left-bar') {
      return (
        <div 
          className="pl-3 py-0.5 mb-3 border-l-4 flex items-center gap-2 font-bold uppercase tracking-wider"
          style={{ 
            borderColor: colorScheme.primary, 
            color: colorScheme.headings,
            ...fontStyle 
          }}
        >
          {icon}
          <span className={headingSizeMap[typography.fontSize]}>{title}</span>
        </div>
      );
    }

    if (headingStyle === 'bordered') {
      return (
        <div 
          className="border-b-2 pb-1 mb-3 flex items-center justify-between font-bold uppercase tracking-wider"
          style={{ 
            borderColor: colorScheme.primary, 
            color: colorScheme.headings,
            ...fontStyle 
          }}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className={headingSizeMap[typography.fontSize]}>{title}</span>
          </div>
          <span className="w-8 h-1" style={{ backgroundColor: colorScheme.primary }} />
        </div>
      );
    }

    if (headingStyle === 'uppercase-accent') {
      return (
        <div className="mb-3">
          <div 
            className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
            style={{ color: colorScheme.primary, ...fontStyle }}
          >
            {icon}
            <span>{title}</span>
          </div>
          <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: colorScheme.primary }} />
        </div>
      );
    }

    if (headingStyle === 'clean') {
      return (
        <div 
          className="mb-3 font-semibold uppercase tracking-wider flex items-center gap-2"
          style={{ color: colorScheme.headings, ...fontStyle }}
        >
          {icon}
          <span className={headingSizeMap[typography.fontSize]}>{title}</span>
        </div>
      );
    }

    // Default: underlined
    return (
      <div className="mb-3">
        <div 
          className="flex items-center gap-2 font-bold uppercase tracking-wide pb-1 border-b"
          style={{ 
            borderColor: colorScheme.divider, 
            color: colorScheme.headings,
            ...fontStyle 
          }}
        >
          {icon}
          <span className={headingSizeMap[typography.fontSize]}>{title}</span>
        </div>
      </div>
    );
  };

  // Section checks
  const isVisible = (key: SectionKey) => !hiddenSections.includes(key);

  // Photo element
  const renderPhoto = () => {
    if (!personal.photoUrl) return null;
    const shapeClass = 
      personal.photoShape === 'circle' ? 'rounded-full' :
      personal.photoShape === 'square' ? 'rounded-none' : 'rounded-2xl';

    return (
      <div className="flex-shrink-0">
        <img
          src={personal.photoUrl}
          alt={personal.fullName}
          className={`object-cover border-2 shadow-sm ${shapeClass}`}
          style={{
            width: `${personal.photoSize || 90}px`,
            height: `${personal.photoSize || 90}px`,
            borderColor: colorScheme.primary,
          }}
        />
      </div>
    );
  };

  // Contact info items
  const renderContactInfo = (layoutOrientation: 'row' | 'column' = 'row', textColor?: string) => {
    const color = textColor || colorScheme.bodyText;
    const items = [
      personal.email && (
        <a key="email" href={`mailto:${personal.email}`} className="flex items-center gap-1.5 hover:underline" style={{ color }}>
          <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colorScheme.primary }} />
          <span>{personal.email}</span>
        </a>
      ),
      personal.phone && (
        <a key="phone" href={`tel:${personal.phone}`} className="flex items-center gap-1.5 hover:underline" style={{ color }}>
          <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colorScheme.primary }} />
          <span>{personal.phone}</span>
        </a>
      ),
      personal.location && (
        <div key="loc" className="flex items-center gap-1.5" style={{ color }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colorScheme.primary }} />
          <span>{personal.location}</span>
        </div>
      ),
      personal.linkedin && (
        <a key="li" href={`https://${personal.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color }}>
          <LinkedInIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colorScheme.primary }} />
          <span>{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
        </a>
      ),
      personal.portfolio && (
        <a key="port" href={`https://${personal.portfolio.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color }}>
          <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colorScheme.primary }} />
          <span>{personal.portfolio.replace(/^https?:\/\//, '')}</span>
        </a>
      ),
      personal.website && (
        <a key="web" href={`https://${personal.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color }}>
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colorScheme.primary }} />
          <span>{personal.website.replace(/^https?:\/\//, '')}</span>
        </a>
      ),
    ].filter(Boolean);

    if (layoutOrientation === 'column') {
      return <div className="flex flex-col gap-2 text-xs">{items}</div>;
    }

    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {item}
            {idx < items.length - 1 && <span className="opacity-40">•</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Section: Summary
  const renderSummarySection = () => {
    if (!isVisible('summary')) return null;
    if (!summary.professionalSummary && !summary.careerObjective && (!summary.careerHighlights || summary.careerHighlights.length === 0)) return null;

    return (
      <div key="sec-summary" className="mb-6">
        {renderSectionHeading('Professional Summary', <User className="w-4 h-4" />)}
        {summary.professionalSummary && (
          <p className="whitespace-pre-line text-justify leading-relaxed">
            {summary.professionalSummary}
          </p>
        )}
        {summary.careerObjective && (
          <p className="mt-2 text-justify italic opacity-90">
            <strong className="not-italic font-semibold" style={{ color: colorScheme.headings }}>Objective: </strong>
            {summary.careerObjective}
          </p>
        )}
        {summary.careerHighlights && summary.careerHighlights.length > 0 && (
          <div className="mt-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: colorScheme.primary }}>Key Career Highlights</h4>
            <ul className="space-y-1">
              {summary.careerHighlights.map((hl, i) => (
                <li key={i} className="flex items-start text-xs">
                  {renderBulletIcon()}
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Section: Work Experience
  const renderExperienceSection = () => {
    if (!isVisible('experience')) return null;
    if (!experience || experience.length === 0) return null;

    const isTimelineTemplate = templateId === 'timeline-express';

    return (
      <div key="sec-experience" className="mb-6">
        {renderSectionHeading('Work Experience', <Briefcase className="w-4 h-4" />)}
        <div className={`space-y-5 ${isTimelineTemplate ? 'border-l-2 pl-4 ml-1 relative' : ''}`} style={isTimelineTemplate ? { borderColor: colorScheme.primary } : undefined}>
          {experience.map((exp, idx) => {
            const dateStr = `${exp.startDate || ''} – ${exp.isCurrent ? 'Present' : exp.endDate || ''}`;
            const bullets = exp.achievements ? exp.achievements.split('\n').filter(b => b.trim().length > 0) : [];

            return (
              <div key={exp.id || idx} className="relative group">
                {isTimelineTemplate && (
                  <span 
                    className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 bg-white"
                    style={{ borderColor: colorScheme.primary }} 
                  />
                )}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                  <div>
                    <h3 className="font-bold text-[15px]" style={{ color: colorScheme.headings }}>
                      {exp.jobTitle || 'Role Title'}
                    </h3>
                    <div className="text-xs font-medium flex items-center gap-1.5" style={{ color: colorScheme.primary }}>
                      <span>{exp.company}</span>
                      {exp.location && <span className="opacity-60">• {exp.location}</span>}
                      {exp.employmentType && <span className="opacity-60">({exp.employmentType})</span>}
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 self-start sm:self-auto" style={{ backgroundColor: colorScheme.sectionHighlight, color: colorScheme.headings }}>
                    <Calendar className="w-3 h-3 opacity-60" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {exp.responsibilities && (
                  <p className="text-xs mb-2 leading-relaxed opacity-90">
                    {exp.responsibilities}
                  </p>
                )}

                {bullets.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        {renderBulletIcon()}
                        <span className="flex-1 leading-relaxed">{bullet.replace(/^[•\-\*]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Section: Education
  const renderEducationSection = () => {
    if (!isVisible('education')) return null;
    if (!education || education.length === 0) return null;

    return (
      <div key="sec-education" className="mb-6">
        {renderSectionHeading('Education', <GraduationCap className="w-4 h-4" />)}
        <div className="space-y-4">
          {education.map((edu, idx) => {
            const yearStr = `${edu.startYear || ''} – ${edu.graduationYear || ''}`.replace(/^ – | – $/g, '');
            return (
              <div key={edu.id || idx}>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h3 className="font-bold text-[14px]" style={{ color: colorScheme.headings }}>
                      {edu.degree}
                    </h3>
                    <div className="text-xs font-medium" style={{ color: colorScheme.primary }}>
                      {edu.institution} {edu.location ? `• ${edu.location}` : ''}
                    </div>
                  </div>
                  {yearStr && (
                    <div className="text-xs px-2 py-0.5 rounded flex items-center gap-1 self-start sm:self-auto" style={{ backgroundColor: colorScheme.sectionHighlight }}>
                      <Calendar className="w-3 h-3 opacity-60" />
                      <span>{yearStr}</span>
                    </div>
                  )}
                </div>

                {(edu.fieldOfStudy || edu.gpa) && (
                  <div className="text-xs mt-1 flex flex-wrap gap-x-3 opacity-80">
                    {edu.fieldOfStudy && <span><strong>Major:</strong> {edu.fieldOfStudy}</span>}
                    {edu.gpa && <span><strong>GPA:</strong> {edu.gpa}</span>}
                  </div>
                )}

                {edu.description && (
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {edu.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Section: Skills
  const renderSkillsSection = (isCompactBadge: boolean = false) => {
    if (!isVisible('skills')) return null;
    const { technical, professional, soft, industrySpecific } = skills;
    const hasAnySkill = (technical?.length || 0) + (professional?.length || 0) + (soft?.length || 0) + (industrySpecific?.length || 0) > 0;
    if (!hasAnySkill) return null;

    return (
      <div key="sec-skills" className="mb-6">
        {renderSectionHeading('Skills & Competencies', <Code className="w-4 h-4" />)}
        
        <div className="space-y-2.5 text-xs">
          {technical && technical.length > 0 && (
            <div>
              <span className="font-semibold block mb-1" style={{ color: colorScheme.headings }}>Technical Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {technical.map((s, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 rounded font-medium border text-xs"
                    style={{ 
                      backgroundColor: colorScheme.sectionHighlight,
                      borderColor: colorScheme.divider,
                      color: colorScheme.headings 
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {professional && professional.length > 0 && (
            <div>
              <span className="font-semibold block mb-1" style={{ color: colorScheme.headings }}>Professional Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {professional.map((s, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 rounded font-medium border text-xs"
                    style={{ 
                      backgroundColor: colorScheme.sectionHighlight,
                      borderColor: colorScheme.divider,
                      color: colorScheme.headings 
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {soft && soft.length > 0 && (
            <div>
              <span className="font-semibold block mb-1" style={{ color: colorScheme.headings }}>Soft Skills</span>
              <p className="opacity-90">{soft.join('  •  ')}</p>
            </div>
          )}

          {industrySpecific && industrySpecific.length > 0 && (
            <div>
              <span className="font-semibold block mb-1" style={{ color: colorScheme.headings }}>Industry Expertise</span>
              <p className="opacity-90">{industrySpecific.join('  •  ')}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Section: Projects
  const renderProjectsSection = () => {
    if (!isVisible('projects')) return null;
    if (!additional.projects || additional.projects.length === 0) return null;

    return (
      <div key="sec-projects" className="mb-6">
        {renderSectionHeading('Projects', <Code className="w-4 h-4" />)}
        <div className="space-y-3.5">
          {additional.projects.map((proj, idx) => (
            <div key={proj.id || idx}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[14px]" style={{ color: colorScheme.headings }}>
                    {proj.title}
                  </h3>
                  {proj.role && <span className="text-xs font-medium opacity-70">({proj.role})</span>}
                  {proj.link && (
                    <a 
                      href={`https://${proj.link.replace(/^https?:\/\//, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs flex items-center gap-0.5 underline font-medium"
                      style={{ color: colorScheme.primary }}
                    >
                      <span>{proj.link.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {(proj.startDate || proj.endDate) && (
                  <span className="text-xs opacity-70">{proj.startDate} – {proj.endDate || 'Present'}</span>
                )}
              </div>

              {proj.description && (
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {proj.description}
                </p>
              )}

              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {proj.technologies.map((t, i) => (
                    <span key={i} className="text-[11px] px-1.5 py-0.2 rounded border bg-slate-50 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Certifications
  const renderCertificationsSection = () => {
    if (!isVisible('certifications')) return null;
    if (!additional.certifications || additional.certifications.length === 0) return null;

    return (
      <div key="sec-certifications" className="mb-6">
        {renderSectionHeading('Certifications', <Award className="w-4 h-4" />)}
        <ul className="space-y-2 text-xs">
          {additional.certifications.map((cert, idx) => (
            <li key={cert.id || idx} className="flex items-start">
              {renderBulletIcon()}
              <div className="flex-1">
                <span className="font-bold" style={{ color: colorScheme.headings }}>{cert.name}</span>
                <span className="opacity-80"> — {cert.issuer}</span>
                {cert.issueDate && <span className="opacity-60"> ({cert.issueDate})</span>}
                {cert.credentialId && <span className="opacity-60 font-mono text-[11px]"> [ID: {cert.credentialId}]</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Section: Awards
  const renderAwardsSection = () => {
    if (!isVisible('awards')) return null;
    if (!additional.awards || additional.awards.length === 0) return null;

    return (
      <div key="sec-awards" className="mb-6">
        {renderSectionHeading('Honors & Awards', <Award className="w-4 h-4" />)}
        <div className="space-y-2 text-xs">
          {additional.awards.map((award, idx) => (
            <div key={award.id || idx}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold" style={{ color: colorScheme.headings }}>{award.title}</span>
                {award.date && <span className="opacity-60 text-[11px]">{award.date}</span>}
              </div>
              <div className="opacity-80" style={{ color: colorScheme.primary }}>{award.issuer}</div>
              {award.description && <p className="opacity-90 mt-0.5">{award.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Languages
  const renderLanguagesSection = () => {
    if (!isVisible('languages')) return null;
    if (!additional.languages || additional.languages.length === 0) return null;

    return (
      <div key="sec-languages" className="mb-6">
        {renderSectionHeading('Languages', <Globe className="w-4 h-4" />)}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {additional.languages.map((l, idx) => (
            <div key={l.id || idx} className="flex justify-between items-center py-0.5 border-b" style={{ borderColor: colorScheme.divider }}>
              <span className="font-semibold" style={{ color: colorScheme.headings }}>{l.language}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: colorScheme.sectionHighlight, color: colorScheme.primary }}>
                {l.proficiency}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Internships
  const renderInternshipsSection = () => {
    if (!isVisible('internships')) return null;
    if (!additional.internships || additional.internships.length === 0) return null;

    return (
      <div key="sec-internships" className="mb-6">
        {renderSectionHeading('Internships', <Briefcase className="w-4 h-4" />)}
        <div className="space-y-3 text-xs">
          {additional.internships.map((intern, idx) => (
            <div key={intern.id || idx}>
              <div className="flex justify-between items-baseline font-bold" style={{ color: colorScheme.headings }}>
                <span>{intern.role} — {intern.organization}</span>
                <span className="text-[11px] font-normal opacity-70">{intern.startDate} – {intern.endDate}</span>
              </div>
              <p className="mt-1 leading-relaxed opacity-90">{intern.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Publications & Research
  const renderPublicationsSection = () => {
    if (!isVisible('publications')) return null;
    if (!additional.publications || additional.publications.length === 0) return null;

    return (
      <div key="sec-publications" className="mb-6">
        {renderSectionHeading('Publications', <BookOpen className="w-4 h-4" />)}
        <div className="space-y-2 text-xs">
          {additional.publications.map((pub, idx) => (
            <div key={pub.id || idx}>
              <div className="font-bold" style={{ color: colorScheme.headings }}>"{pub.title}"</div>
              <div className="opacity-80 italic">{pub.publisher} {pub.date ? `(${pub.date})` : ''}</div>
              {pub.description && <p className="mt-0.5 opacity-90">{pub.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Section: Licenses
  const renderLicensesSection = () => {
    if (!isVisible('licenses')) return null;
    if (!additional.licenses || additional.licenses.length === 0) return null;

    return (
      <div key="sec-licenses" className="mb-6">
        {renderSectionHeading('Licenses & Credentials', <CheckCircle2 className="w-4 h-4" />)}
        <div className="space-y-2 text-xs">
          {additional.licenses.map((lic, idx) => (
            <div key={lic.id || idx} className="flex justify-between items-baseline border-b pb-1" style={{ borderColor: colorScheme.divider }}>
              <div>
                <span className="font-bold" style={{ color: colorScheme.headings }}>{lic.name}</span>
                <span className="opacity-70"> ({lic.issuingAuthority})</span>
                {lic.licenseNumber && <div className="text-[11px] font-mono opacity-60">Lic #: {lic.licenseNumber}</div>}
              </div>
              {lic.validUntil && <span className="text-[11px] opacity-70">Exp: {lic.validUntil}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Dynamic Section Dispatcher
  const renderSectionByKey = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        return renderSummarySection();
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      case 'projects':
        return renderProjectsSection();
      case 'certifications':
        return renderCertificationsSection();
      case 'awards':
        return renderAwardsSection();
      case 'internships':
        return renderInternshipsSection();
      case 'publications':
        return renderPublicationsSection();
      case 'languages':
        return renderLanguagesSection();
      case 'licenses':
        return renderLicensesSection();
      default:
        return null;
    }
  };

  // Split into Main and Sidebar for two-column templates
  const isTwoColumn = layout.layoutType === 'two-column' || layout.layoutType === 'sidebar-left' || layout.layoutType === 'sidebar-right' || templateId === 'nordic-split' || templateId === 'sidebar-dark' || templateId === 'tech-innovator';
  const sidebarIsLeft = layout.layoutType === 'sidebar-left' || templateId === 'nordic-split' || templateId === 'sidebar-dark';

  const sidebarSections: SectionKey[] = ['skills', 'education', 'certifications', 'languages', 'licenses', 'awards'];
  const mainSections: SectionKey[] = sectionOrder.filter(s => !sidebarSections.includes(s));

  // Top Banner Template variant
  const isTopBanner = templateId === 'top-banner-bold';
  const isAccentFrame = templateId === 'accent-left-border';

  return (
    <div
      id="resume-preview-document"
      className={`mx-auto bg-white shadow-xl transition-all duration-200 ${paddingMap[layout.pagePadding || 'normal']} ${lineSpacingMap[typography.lineSpacing || 'normal']} ${letterSpacingMap[typography.letterSpacing || 'normal']} ${fontSizeMap[typography.fontSize || 'medium']}`}
      style={{
        width: `${baseWidthPx}px`,
        minHeight: `${minHeightPx}px`,
        ...fontFamilyStyle,
        backgroundColor: colorScheme.background || '#ffffff',
        borderLeft: isAccentFrame ? `8px solid ${colorScheme.primary}` : undefined,
      }}
    >
      {/* TOP BANNER VARIANT */}
      {isTopBanner ? (
        <div 
          className="-mx-8 sm:-mx-12 -mt-8 sm:-mt-12 p-8 sm:p-10 mb-8 text-white flex flex-col sm:flex-row items-center gap-6 justify-between shadow-md"
          style={{ backgroundColor: colorScheme.primary }}
        >
          <div className="text-center sm:text-left flex-1">
            <h1 
              className={`font-black uppercase tracking-tight ${nameSizeMap[typography.fontSize]}`}
              style={{ fontFamily: typography.nameFont || typography.fontFamily }}
            >
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.professionalTitle && (
              <p className="text-base sm:text-lg font-medium opacity-90 mt-1">
                {personal.professionalTitle}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90 text-white">
              {renderContactInfo('row', '#ffffff')}
            </div>
          </div>
          {personal.photoUrl && renderPhoto()}
        </div>
      ) : (
        /* STANDARD OR TWO-COLUMN HEADER */
        <header className="mb-6 pb-4 border-b flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderColor: colorScheme.divider }}>
          <div className="text-center sm:text-left flex-1">
            <h1
              className={`font-black tracking-tight ${nameSizeMap[typography.fontSize]}`}
              style={{
                fontFamily: typography.nameFont || typography.fontFamily,
                color: colorScheme.headings,
              }}
            >
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.professionalTitle && (
              <p 
                className="text-base sm:text-lg font-semibold mt-0.5 tracking-wide"
                style={{ color: colorScheme.primary }}
              >
                {personal.professionalTitle}
              </p>
            )}
            <div className="mt-3">
              {renderContactInfo('row')}
            </div>
          </div>
          {personal.photoUrl && renderPhoto()}
        </header>
      )}

      {/* DOCUMENT BODY: TWO-COLUMN vs SINGLE-COLUMN */}
      {isTwoColumn ? (
        <div className={`grid grid-cols-12 gap-8 ${sidebarIsLeft ? '' : ''}`}>
          {/* Sidebar */}
          <aside 
            className={`col-span-12 md:col-span-4 p-4 rounded-lg space-y-6 ${sidebarIsLeft ? 'order-1 md:order-1' : 'order-2 md:order-2'}`}
            style={{ 
              backgroundColor: templateId === 'sidebar-dark' ? '#0f172a' : colorScheme.sidebar || '#f8fafc',
              color: templateId === 'sidebar-dark' ? '#f1f5f9' : colorScheme.bodyText,
            }}
          >
            {sidebarSections.map(key => isVisible(key) && renderSectionByKey(key))}
          </aside>

          {/* Main Column */}
          <main className={`col-span-12 md:col-span-8 ${sidebarIsLeft ? 'order-2 md:order-2' : 'order-1 md:order-1'}`}>
            {mainSections.map(key => isVisible(key) && renderSectionByKey(key))}
          </main>
        </div>
      ) : (
        /* SINGLE COLUMN */
        <main>
          {sectionOrder.map(key => isVisible(key) && renderSectionByKey(key))}
        </main>
      )}

      {/* FOOTER PAGINATION */}
      {pageSettings.showPageNumbers && (
        <footer className="mt-12 pt-4 border-t flex justify-between items-center text-[11px] opacity-50" style={{ borderColor: colorScheme.divider }}>
          <span>{personal.fullName || 'Resume'} — Confidential</span>
          <span>Page 1 of 1</span>
        </footer>
      )}
    </div>
  );
};
