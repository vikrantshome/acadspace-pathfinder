
import { StudentReport } from '@/types';

export async function generatePuppeteerPDF(
  reportData: StudentReport, 
  userId: string,
  mobileNo?: string,
  studentID?: string,
  studentName?: string
): Promise<string> {
  const puppeteerServiceUrl = import.meta.env.VITE_PUPPETEER_MS_URL || 'http://localhost:5200';
  
  const response = await fetch(`${puppeteerServiceUrl}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportData, userId, mobileNo, studentID, studentName }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorBody}`);
  }

  // Parse response as JSON
  const responseJson = await response.json();
  if (responseJson && responseJson.reportLink) {
    return responseJson.reportLink;
  } else {
    throw new Error('Invalid response from PDF service: reportLink not found.');
  }
}
