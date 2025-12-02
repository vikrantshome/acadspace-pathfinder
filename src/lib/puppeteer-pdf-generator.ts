
import { ReportData } from './pdf-generator';


// New PDF service utility: POST to http://localhost:5100/generate-pdf, expect PDF blob
export async function generatePDFServiceBlob(
  reportData: ReportData
): Promise<Blob> {
  const pdfServiceUrl = 'http://localhost:5100';
  const response = await fetch(`${pdfServiceUrl}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorBody}`);
  }

  return await response.blob();
}
