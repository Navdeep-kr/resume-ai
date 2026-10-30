import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPdf(
  elementId: string,
  fileName: string = 'Resume.pdf',
  pageSize: 'A4' | 'Letter' = 'A4'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Resume preview element not found.');
  }

  // Dimensions in mm
  const isA4 = pageSize === 'A4';
  const pdfWidth = isA4 ? 210 : 215.9;
  const pdfHeight = isA4 ? 297 : 279.4;

  // Clone or render high DPI canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 2x retina clarity
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize.toLowerCase() as 'a4' | 'letter',
  });

  // Calculate page heights in canvas coordinates
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Add additional pages if document overflows 1 page
  while (heightLeft > 5) {
    position = -(imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  pdf.save(fileName);
}

export function printResume(): void {
  window.print();
}
