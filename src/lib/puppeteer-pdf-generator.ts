
import { apiService } from './api';

export async function generatePuppeteerPDF(
  reportId: string,
  partner?: string
): Promise<string> {
  try {
    const response = await apiService.getReportLink(reportId, partner);
    if (response && response.reportLink) {
      return response.reportLink;
    } else {
      throw new Error('Invalid response from PDF link service: reportLink not found.');
    }
  } catch (error) {
    console.error('Error fetching report link:', error);
    throw new Error('Failed to retrieve PDF link.');
  }
}
