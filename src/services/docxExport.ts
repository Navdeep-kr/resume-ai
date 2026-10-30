import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '../types/resume';

export async function exportToDocx(resume: ResumeData): Promise<void> {
  const primaryHex = (resume.design.colorScheme.primary || '#4f46e5').replace('#', '');
  const darkHex = '1e293b';
  const mutedHex = '64748b';

  const sections: Paragraph[] = [];

  // Helper to make section heading
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: primaryHex,
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          color: primaryHex,
          size: 24, // 12pt
          font: resume.design.typography.headingFont || 'Calibri',
        }),
      ],
    });
  };

  // Header: Full Name
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: resume.personal.fullName || 'Untitled Resume',
          bold: true,
          size: 36, // 18pt
          color: primaryHex,
          font: resume.design.typography.nameFont || 'Calibri',
        }),
      ],
    })
  );

  // Subtitle: Professional Title
  if (resume.personal.professionalTitle) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: resume.personal.professionalTitle,
            size: 24, // 12pt
            color: darkHex,
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Contact Info Row
  const contactParts: string[] = [];
  if (resume.personal.email) contactParts.push(resume.personal.email);
  if (resume.personal.phone) contactParts.push(resume.personal.phone);
  if (resume.personal.location) contactParts.push(resume.personal.location);
  if (resume.personal.linkedin) contactParts.push(resume.personal.linkedin);
  if (resume.personal.website) contactParts.push(resume.personal.website);

  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: 18, // 9pt
            color: mutedHex,
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Professional Summary
  if (resume.summary.professionalSummary) {
    sections.push(createSectionHeader('Professional Summary'));
    sections.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: resume.summary.professionalSummary,
            size: 21,
            color: darkHex,
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Work Experience
  if (resume.experience && resume.experience.length > 0) {
    sections.push(createSectionHeader('Work Experience'));
    resume.experience.forEach(exp => {
      // Job Title and Company Row
      const dateStr = `${exp.startDate || ''} - ${exp.isCurrent ? 'Present' : exp.endDate || ''}`;
      sections.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 22,
              color: darkHex,
            }),
            new TextRun({
              text: ` — ${exp.company}`,
              bold: true,
              size: 22,
              color: primaryHex,
            }),
            new TextRun({
              text: `  (${dateStr}${exp.location ? ` | ${exp.location}` : ''})`,
              italics: true,
              size: 18,
              color: mutedHex,
            }),
          ],
        })
      );

      // Responsibilities
      if (exp.responsibilities) {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: exp.responsibilities,
                size: 20,
                color: darkHex,
              }),
            ],
          })
        );
      }

      // Achievements bullets
      if (exp.achievements) {
        const bulletLines = exp.achievements.split('\n').filter(b => b.trim().length > 0);
        bulletLines.forEach(bullet => {
          sections.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: bullet.replace(/^[•\-\*]\s*/, ''),
                  size: 20,
                  color: darkHex,
                }),
              ],
            })
          );
        });
      }
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    sections.push(createSectionHeader('Education'));
    resume.education.forEach(edu => {
      const yearStr = `${edu.startYear || ''} - ${edu.graduationYear || ''}`.trim().replace(/^ - |- $/g, '');
      sections.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
              color: darkHex,
            }),
            new TextRun({
              text: ` — ${edu.institution}`,
              size: 22,
              color: primaryHex,
            }),
            new TextRun({
              text: yearStr ? ` (${yearStr})` : '',
              italics: true,
              size: 18,
              color: mutedHex,
            }),
          ],
        })
      );

      if (edu.fieldOfStudy || edu.gpa) {
        const detailParts: string[] = [];
        if (edu.fieldOfStudy) detailParts.push(`Field: ${edu.fieldOfStudy}`);
        if (edu.gpa) detailParts.push(`GPA / Grade: ${edu.gpa}`);
        sections.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: detailParts.join(' | '),
                size: 19,
                color: mutedHex,
              }),
            ],
          })
        );
      }

      if (edu.description) {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: edu.description,
                size: 19,
                color: darkHex,
              }),
            ],
          })
        );
      }
    });
  }

  // Skills
  const allSkills = [
    ...(resume.skills.technical || []),
    ...(resume.skills.professional || []),
    ...(resume.skills.soft || []),
    ...(resume.skills.industrySpecific || []),
  ];

  if (allSkills.length > 0) {
    sections.push(createSectionHeader('Key Competencies & Skills'));
    if (resume.skills.technical && resume.skills.technical.length > 0) {
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'Technical Skills: ', bold: true, size: 20 }),
            new TextRun({ text: resume.skills.technical.join(', '), size: 20 }),
          ],
        })
      );
    }
    if (resume.skills.professional && resume.skills.professional.length > 0) {
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'Professional Skills: ', bold: true, size: 20 }),
            new TextRun({ text: resume.skills.professional.join(', '), size: 20 }),
          ],
        })
      );
    }
    if (resume.skills.soft && resume.skills.soft.length > 0) {
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'Soft Skills: ', bold: true, size: 20 }),
            new TextRun({ text: resume.skills.soft.join(', '), size: 20 }),
          ],
        })
      );
    }
  }

  // Projects
  if (resume.additional.projects && resume.additional.projects.length > 0) {
    sections.push(createSectionHeader('Key Projects'));
    resume.additional.projects.forEach(proj => {
      sections.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({ text: proj.title, bold: true, size: 21, color: darkHex }),
            proj.role ? new TextRun({ text: ` (${proj.role})`, italics: true, size: 19, color: mutedHex }) : new TextRun({ text: '' }),
            proj.link ? new TextRun({ text: ` — ${proj.link}`, size: 18, color: primaryHex }) : new TextRun({ text: '' }),
          ],
        })
      );
      if (proj.description) {
        sections.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: proj.description, size: 19 })],
          })
        );
      }
    });
  }

  // Certifications
  if (resume.additional.certifications && resume.additional.certifications.length > 0) {
    sections.push(createSectionHeader('Certifications'));
    resume.additional.certifications.forEach(cert => {
      sections.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 30 },
          children: [
            new TextRun({ text: cert.name, bold: true, size: 20 }),
            new TextRun({ text: ` — ${cert.issuer}`, size: 19, color: mutedHex }),
            cert.issueDate ? new TextRun({ text: ` (${cert.issueDate})`, italics: true, size: 18, color: mutedHex }) : new TextRun({ text: '' }),
          ],
        })
      );
    });
  }

  // Languages
  if (resume.additional.languages && resume.additional.languages.length > 0) {
    sections.push(createSectionHeader('Languages'));
    const langStr = resume.additional.languages.map(l => `${l.language} (${l.proficiency})`).join(', ');
    sections.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: langStr, size: 20 })],
      })
    );
  }

  // Document Assembly
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${(resume.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.docx`;
  saveAs(blob, fileName);
}
