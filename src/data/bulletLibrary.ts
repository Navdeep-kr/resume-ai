export interface ActionBulletItem {
  id: string;
  category: string;
  role: string;
  bullet: string;
  tags: string[];
}

export const BULLET_LIBRARY: ActionBulletItem[] = [
  // TECHNOLOGY & SOFTWARE
  {
    id: 'tech-1',
    category: 'Technology',
    role: 'Full Stack & Backend',
    bullet: 'Architected and deployed high-throughput microservices using Go and PostgreSQL, reducing p99 API latency by 45% and supporting 1.5M daily active users.',
    tags: ['Architecture', 'Latency', 'Microservices'],
  },
  {
    id: 'tech-2',
    category: 'Technology',
    role: 'Frontend & UI',
    bullet: 'Re-engineered core web application using React, TypeScript, and Tailwind CSS, increasing Google Lighthouse Core Web Vitals score from 54 to 96.',
    tags: ['Frontend', 'Performance', 'React'],
  },
  {
    id: 'tech-3',
    category: 'Technology',
    role: 'Cloud & DevOps',
    bullet: 'Spearheaded automated CI/CD pipeline modernization with Docker and GitHub Actions, slashing deployment cycle times from 45 minutes to 6 minutes.',
    tags: ['DevOps', 'CI/CD', 'Docker'],
  },
  {
    id: 'tech-4',
    category: 'Technology',
    role: 'Cloud & Infrastructure',
    bullet: 'Orchestrated migration of on-premise infrastructure to AWS (EKS, RDS, S3), achieving 99.99% system uptime and saving $140,000 in annualized server costs.',
    tags: ['AWS', 'Cloud', 'Cost Optimization'],
  },
  {
    id: 'tech-5',
    category: 'Technology',
    role: 'Data & Databases',
    bullet: 'Designed distributed database partitioning and Redis caching layer, accelerating complex analytical query processing speeds by 3.8x.',
    tags: ['Database', 'Caching', 'Redis'],
  },
  {
    id: 'tech-6',
    category: 'Technology',
    role: 'Security & QA',
    bullet: 'Established end-to-end automated test suites using Playwright and Jest, increasing test coverage to 92% and preventing 40+ critical production regressions.',
    tags: ['Testing', 'QA', 'Reliability'],
  },

  // MANAGEMENT & LEADERSHIP
  {
    id: 'mgmt-1',
    category: 'Management',
    role: 'Team Leadership',
    bullet: 'Managed and mentored a high-performing cross-functional team of 14 engineers and designers, achieving a 100% team retention rate across 2 years.',
    tags: ['Mentorship', 'Leadership', 'Retention'],
  },
  {
    id: 'mgmt-2',
    category: 'Management',
    role: 'Operations & Strategy',
    bullet: 'Spearheaded enterprise Agile transformation, increasing sprint delivery velocity by 32% and reducing customer-reported escalations by 48%.',
    tags: ['Agile', 'Scrum', 'Velocity'],
  },
  {
    id: 'mgmt-3',
    category: 'Management',
    role: 'Budget & Procurement',
    bullet: 'Administered $3.2M departmental operating budget, negotiating vendor contracts that yielded $380,000 in recurring annual cost savings.',
    tags: ['Budget', 'Vendors', 'P&L'],
  },
  {
    id: 'mgmt-4',
    category: 'Management',
    role: 'Stakeholder Alignment',
    bullet: 'Partnered with C-suite executives and cross-functional business heads to define quarterly strategic OKRs and align technical roadmaps with revenue goals.',
    tags: ['OKRs', 'Executive', 'Roadmap'],
  },

  // MARKETING & GROWTH
  {
    id: 'mkt-1',
    category: 'Marketing',
    role: 'Growth Marketing',
    bullet: 'Scaled B2B inbound lead generation pipeline by 165% within 12 months, generating $8.4M in qualified sales pipeline through multi-channel demand gen.',
    tags: ['Demand Gen', 'Inbound', 'Pipeline'],
  },
  {
    id: 'mkt-2',
    category: 'Marketing',
    role: 'Paid Acquisition & PPC',
    bullet: 'Managed $1.8M annual paid media budget across Google Ads and LinkedIn Campaigns, decreasing customer acquisition cost (CAC) by 28% while sustaining a 4.1x ROAS.',
    tags: ['PPC', 'CAC', 'ROAS'],
  },
  {
    id: 'mkt-3',
    category: 'Marketing',
    role: 'SEO & Organic Growth',
    bullet: 'Executed comprehensive programmatic SEO content strategy, expanding monthly organic search impressions from 80K to 450K in under 9 months.',
    tags: ['SEO', 'Traffic', 'Content'],
  },
  {
    id: 'mkt-4',
    category: 'Marketing',
    role: 'Conversion Rate Optimization',
    bullet: 'Designed and evaluated 35+ A/B conversion experiments on core landing pages, driving a 34% increase in demo-to-signup conversion rate.',
    tags: ['CRO', 'A/B Testing', 'Conversion'],
  },

  // HEALTHCARE & MEDICAL
  {
    id: 'health-1',
    category: 'Healthcare',
    role: 'Clinical Care',
    bullet: 'Delivered acute inpatient medical care to an average daily census of 18-22 high-acuity patients, sustaining a 97th percentile patient satisfaction rating.',
    tags: ['Patient Care', 'Clinical', 'Inpatient'],
  },
  {
    id: 'health-2',
    category: 'Healthcare',
    role: 'Quality & Safety',
    bullet: 'Instituted early-detection sepsis clinical protocol, reducing hospital sepsis-related mortality by 19% across 4 acute care units.',
    tags: ['Protocol', 'Quality', 'Patient Safety'],
  },
  {
    id: 'health-3',
    category: 'Healthcare',
    role: 'Documentation & EMR',
    bullet: 'Spearheaded clinical department transition to modern Epic EHR workflows, shortening daily charting time by 45 minutes per provider while maintaining 100% HIPAA compliance.',
    tags: ['EHR', 'Epic', 'HIPAA'],
  },

  // EDUCATION & PEDAGOGY
  {
    id: 'edu-1',
    category: 'Education',
    role: 'Curriculum & Pedagogy',
    bullet: 'Designed and implemented experiential STEM curriculum aligning with state NGSS standards, elevating student standardized test proficiency from 68% to 92%.',
    tags: ['Curriculum', 'STEM', 'Standards'],
  },
  {
    id: 'edu-2',
    category: 'Education',
    role: 'Instruction & Testing',
    bullet: 'Taught AP Physics and Chemistry to 150+ secondary students, achieving an 89% AP exam pass rate (Score 3+) compared to the 64% national average.',
    tags: ['AP Exam', 'Pass Rate', 'STEM'],
  },
  {
    id: 'edu-3',
    category: 'Education',
    role: 'Digital Learning',
    bullet: 'Integrated interactive digital learning tools and flipped-classroom laboratory simulations, improving quarterly student retention by 22%.',
    tags: ['EdTech', 'Simulation', 'Engagement'],
  },

  // FINANCE & ACCOUNTING
  {
    id: 'fin-1',
    category: 'Finance',
    role: 'Financial Analysis',
    bullet: 'Built dynamic discounted cash flow (DCF) and three-statement financial models in Excel, evaluating $450M in prospective corporate acquisition targets.',
    tags: ['Modeling', 'M&A', 'Valuation'],
  },
  {
    id: 'fin-2',
    category: 'Finance',
    role: 'Auditing & Accounting',
    bullet: 'Conducted comprehensive internal financial audits across 6 regional subsidiaries, identifying $260,000 in payroll discrepancies and improving SOX compliance.',
    tags: ['Audit', 'SOX', 'Compliance'],
  },
  {
    id: 'fin-3',
    category: 'Finance',
    role: 'Cost Reduction',
    bullet: 'Analyzed global supply chain vendor expenditures, restructuring payment terms and capturing $410,000 in early-payment discount savings.',
    tags: ['Cost Savings', 'Vendor', 'Treasury'],
  },

  // SALES & BUSINESS DEVELOPMENT
  {
    id: 'sales-1',
    category: 'Sales',
    role: 'Enterprise Sales',
    bullet: 'Exceeded enterprise sales quota for 6 consecutive quarters, closing $4.2M in annual recurring revenue (ARR) with Fortune 500 accounts.',
    tags: ['Quota', 'Enterprise', 'ARR'],
  },
  {
    id: 'sales-2',
    category: 'Sales',
    role: 'Account Management',
    bullet: 'Managed portfolio of 38 key strategic accounts, maintaining a 118% net revenue retention (NRR) rate through proactive renewals and product upsells.',
    tags: ['NRR', 'Retention', 'Upsells'],
  },

  // PRODUCT MANAGEMENT
  {
    id: 'prod-1',
    category: 'Product',
    role: 'Product Management',
    bullet: 'Led product discovery, roadmap definition, and GTM execution for flagship B2B analytics portal, generating $2.8M in net new ARR within 6 months of launch.',
    tags: ['Product', 'Roadmap', 'GTM'],
  },
  {
    id: 'prod-2',
    category: 'Product',
    role: 'User Experience & Research',
    bullet: 'Conducted 60+ user interviews and customer usability sessions, driving product enhancements that lowered monthly customer churn by 3.2%.',
    tags: ['User Research', 'Churn', 'UX'],
  },
];
