# RESUME AI — The Simplest Universal AI Resume Builder

> **"Your experience. Your story. Your perfect resume."**

A complete, functional, production-ready universal AI resume builder built strictly around a clean **Two-Screen Architecture**.

---

## 🚀 Key Features

### 1. Two-Screen Architecture
- **SCREEN 1: USER DETAILS**
  - **Section A: Personal Details & Contact**: Full name, professional title, email, phone, location, LinkedIn, portfolio, personal website, and optional profile photo (circle, square, rounded, resize slider).
  - **Section B: Professional Summary**: Professional narrative, career objective, and key career highlights with embedded AI assistants (AI Improve, AI Generate Objective, Make Concise, Fix Grammar).
  - **Section C: Work Experience**: Unlimited entries with job title, company, location, employment type, start/end dates, "current job" toggle, responsibilities scope, and bullet achievements with AI enhancement & metric quantification.
  - **Section D: Education**: Degrees, institutions, majors, graduation years, GPA, and academic honors.
  - **Section E: Skills & Competencies**: Multi-category tagging (Technical, Professional, Soft, Industry-specific) with smart AI suggestions tailored to your target profession and one-click batch application.
  - **Section F: Additional Career Sections**: Projects portfolio, certifications, honors & awards, languages matrix, and professional licenses.
  - **Three Input Methods**:
    1. *Manual entry* with intuitive validation and auto-save.
    2. *Resume Import* (upload existing PDF, DOCX, JSON, or text resumes).
    3. *Pre-loaded Profession Examples* (1-click load for Freshers with 0 experience, Software Engineers, Physicians, Teachers, Marketers, and COOs).
  - **AI Job Tailoring**: Paste any target job description to get instant keyword match scoring (%), highlighted skills, missing keywords, and tailored summary generation without fabricating false claims.
  - Prominent **"CREATE MY RESUME"** button with live completion progress bar.

- **SCREEN 2: LIVE RESUME EDITOR & DESIGN CUSTOMIZER**
  - **Live Preview Canvas**: Real, printable A4 and US Letter document preview with instant live updates on every stroke.
  - **20 Professional Resume Templates**:
    1. *Modern Clean* — Versatile contemporary layout with balanced typography.
    2. *Minimalist Pure* — Clean whitespace, distraction-free legibility.
    3. *Corporate Executive* — Navy and slate accents, authoritative hierarchy.
    4. *Classic Elegance* — Traditional serif typography, classical dividers.
    5. *Tech Innovator* — Monospace accents, tag badges, developer-friendly.
    6. *Creative Studio* — Asymmetrical badges, design-forward color accents.
    7. *Nordic Split* — Balanced two-column Scandinavian layout.
    8. *Academic Scholar* — Garamond serif, publication and grant emphasis.
    9. *Healthcare Pro* — Clinical teal, licenses and clinical credentials first.
    10. *Engineering Master* — Robust technical hierarchy and project metrics.
    11. *Entry-Level Kickstart* — Fresh graduate focus (education & projects top).
    12. *International Euro* — Europass-inspired layout with language matrix.
    13. *Top Banner Modern* — Bold colored header band commanding attention.
    14. *Sidebar Contrast* — High-contrast dark sidebar for contact & skills.
    15. *Editorial Magazine* — Playfair Display serif headings and chic rule lines.
    16. *Swiss Grid* — Modernist geometric alignment and strong contrast.
    17. *Timeline Express* — Connected chronological timeline along work history.
    18. *Vanguard Bold* — Uppercase block headers for competitive recruiting.
    19. *Compact 1-Page* — High-density layout engineered for 1-page fit.
    20. *Accent Left Frame* — Continuous vertical accent stripe with badge headers.
  - **Complete Design Controls**:
    - **Color Customization**: 11 professional color presets + custom hex pickers for Accent, Headings, Body Text, Background, and Sidebar.
    - **Typography**: 12 Google Fonts (Inter, Roboto, Outfit, Montserrat, Poppins, Source Sans 3, Merriweather, Lora, Playfair Display, EB Garamond, Fira Code, Space Grotesk), font size scaling, line spacing, and letter spacing.
    - **Layout Customization**: Single-column vs. Two-column, 6 heading styles, 6 bullet styles, margins, and paper padding.
    - **Page Settings**: A4 vs. US Letter with automated pagination.
    - **Section Reordering & Visibility**: Drag or move sections up/down and toggle visibility with eye icons.
  - **Export & Download**:
    - **PDF Download**: High-resolution client-side PDF export with exact dimensions and pagination.
    - **Editable DOCX Download**: Real Microsoft Word `.docx` file generated dynamically with formatted headers, tables, bullet points, and accent colors.
    - **Browser Print**: Dedicated `@media print` CSS for crisp vector printing or saving via the browser's native print engine.
  - **Save & Continue**:
    - Private browser LocalStorage persistence (no data uploaded to third parties).
    - Multi-document management (create new, duplicate, switch, rename, delete).
    - Version history snapshots with 1-click restore checkpoints.

---

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Document Export**:
  - `docx` (Official Microsoft Word document synthesis)
  - `jspdf` & `html2canvas` (Vector/Retina PDF generation)
  - Native `@media print` CSS
- **Icons**: Lucide React + Custom SVG Icons
- **AI Integration**:
  - Built-in Intelligent Rule-based NLP Engine (works 100% offline and out-of-the-box)
  - Configurable live API connectors for Google Gemini (`gemini-1.5-flash`) and OpenAI (`gpt-4o-mini`)
- **Delight**: `canvas-confetti` celebration on export

---

## 🏃‍♂️ Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```
