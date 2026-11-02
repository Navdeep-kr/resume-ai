import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Universal, high-fidelity PDF Exporter.
 * Clones pages into an isolated, unscaled sandbox to completely eliminate
 * transform clipping, scroll offset errors, and empty canvas artifacts.
 */
export async function exportToPdf(
  elementId: string = 'resume-print-document',
  fileName: string = 'Resume.pdf',
  pageSize: 'A4' | 'Letter' = 'A4'
): Promise<void> {
  // Dimensions
  const isA4 = pageSize === 'A4';
  const pdfWidth = isA4 ? 210 : 215.9;
  const pdfHeight = isA4 ? 297 : 279.4;
  const baseWidthPx = isA4 ? 794 : 816;
  const minHeightPx = isA4 ? 1123 : 1056;

  // 1. Locate resume page elements
  let pages: HTMLElement[] = [];
  const printDoc = document.getElementById('resume-print-document');
  const specifiedDoc = document.getElementById(elementId);
  const targetRoot = printDoc || specifiedDoc || document.getElementById('resume-preview-document');

  if (targetRoot) {
    pages = Array.from(targetRoot.querySelectorAll<HTMLElement>('.resume-page'));
    if (pages.length === 0) {
      pages = [targetRoot];
    }
  } else {
    pages = Array.from(document.querySelectorAll<HTMLElement>('.resume-page'));
  }

  if (pages.length === 0) {
    throw new Error('Resume content element not found in the document.');
  }

  // 2. Initialize jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize.toLowerCase() as 'a4' | 'letter',
  });

  // 3. Ensure web fonts are completely loaded
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if fonts check is unavailable
    }
  }

  // 4. Render each page in an isolated unscaled sandbox
  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];
    if (i > 0) {
      pdf.addPage();
    }

    // Create an unscaled, isolated sandbox container attached to document.body
    // High z-index ensures no UI modals or backdrops mask it
    const sandbox = document.createElement('div');
    sandbox.setAttribute('data-pdf-export-sandbox', 'true');
    sandbox.style.position = 'fixed';
    sandbox.style.top = '0';
    sandbox.style.left = '0';
    sandbox.style.width = `${baseWidthPx}px`;
    sandbox.style.minHeight = `${minHeightPx}px`;
    sandbox.style.zIndex = '999999';
    sandbox.style.opacity = '1';
    sandbox.style.visibility = 'visible';
    sandbox.style.pointerEvents = 'none';
    sandbox.style.backgroundColor = '#ffffff';
    sandbox.style.margin = '0';
    sandbox.style.padding = '0';
    sandbox.style.transform = 'none';
    sandbox.style.overflow = 'visible';

    // Clone the page element deeply
    const clone = pageEl.cloneNode(true) as HTMLElement;

    // Reset styles on clone to ensure full visibility and exact physical dimensions
    clone.style.display = 'flex';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    clone.style.width = `${baseWidthPx}px`;
    clone.style.minHeight = `${minHeightPx}px`;

    // Ensure all descendant elements are visible
    clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
      el.style.visibility = 'visible';
    });

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    // Wait for any images inside the clone to load
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Allow browser two animation frames for layout calculation
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 60));

    try {
      const renderHeight = Math.max(clone.scrollHeight, minHeightPx);
      const canvas = await html2canvas(clone, {
        scale: 2, // 2x retina crispness
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: baseWidthPx,
        height: renderHeight,
        windowWidth: baseWidthPx,
        windowHeight: renderHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } finally {
      if (sandbox.parentNode) {
        sandbox.parentNode.removeChild(sandbox);
      }
    }
  }

  pdf.save(fileName);
}

export function printResume(): void {
  window.print();
}
