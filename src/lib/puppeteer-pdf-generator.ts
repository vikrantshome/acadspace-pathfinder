
import { ReportData } from './pdf-generator';

export async function generatePuppeteerPDF(reportData: ReportData, userId: string): Promise<Blob> {
  const puppeteerServiceUrl = import.meta.env.VITE_PUPPETEER_MS_URL || 'http://localhost:5200';
  
  const response = await fetch(`${puppeteerServiceUrl}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportData, userId }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorBody}`);
  }

  const pdfBlob = await response.blob();
  return pdfBlob;
}
