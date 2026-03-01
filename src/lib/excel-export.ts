import * as XLSX from 'xlsx';
import vibematchQuestions from '@/data/vibematch_questions.json';
import edustatsQuestions from '@/data/edustats_questions.json';

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  instruction?: string;
  riasec_map?: Record<string, number>;
}

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportTestQuestionsToExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Process VIBEMatch Questions
  const vibematchData = [
    ['VIBEMATCH ASSESSMENT - Career Interest Inventory'],
    [''],
    ['Question ID', 'Question Text', 'Question Type', 'Required', 'Options', 'Instructions', 'RIASEC Mapping'],
    ...vibematchQuestions.map((q: Question) => [
      q.id,
      q.text,
      q.type,
      q.required ? 'Yes' : 'No',
      q.options ? q.options.join('; ') : (q.type === 'likert' ? 'Strongly Disagree; Disagree; Neutral; Agree; Strongly Agree' : 'Text response'),
      q.instruction || '',
      q.riasec_map ? Object.entries(q.riasec_map).map(([key, val]) => `${key}:${val}`).join(', ') : ''
    ])
  ];

  // Process EduStats Questions
  const edustatsData = [
    ['EDUSTATS ASSESSMENT - Educational Background & Context'],
    [''],
    ['Question ID', 'Question Text', 'Question Type', 'Required', 'Options', 'Instructions', 'Notes'],
    ...edustatsQuestions.map((q: Question) => [
      q.id,
      q.text,
      q.type,
      q.required ? 'Yes' : 'No',
      q.options ? q.options.join('; ') : (q.type === 'subjective' ? 'Text response' : q.type === 'numeric-grid' ? 'Numeric input grid' : 'Custom response'),
      q.instruction || '',
      q.type === 'multi' ? 'Multiple selection allowed' : q.type === 'single' ? 'Single selection only' : ''
    ])
  ];

  // Create worksheets
  const ws1 = XLSX.utils.aoa_to_sheet(vibematchData);
  const ws2 = XLSX.utils.aoa_to_sheet(edustatsData);

  // Set column widths for better readability
  const colWidths = [
    { wch: 12 },  // Question ID
    { wch: 80 },  // Question Text
    { wch: 15 },  // Type
    { wch: 10 },  // Required
    { wch: 60 },  // Options
    { wch: 30 },  // Instructions
    { wch: 20 }   // RIASEC/Notes
  ];

  ws1['!cols'] = colWidths;
  ws2['!cols'] = colWidths;

  // Style the header rows
  const headerStyle = {
    font: { bold: true, sz: 14 },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'VIBEMatch Questions');
  XLSX.utils.book_append_sheet(wb, ws2, 'EduStats Questions');

  // Create summary sheet
  const summaryData = [
    ['NAVIKSHA TEST QUESTIONS EXPORT'],
    [''],
    ['Export Date:', new Date().toLocaleString()],
    [''],
    ['TEST SECTIONS OVERVIEW'],
    [''],
    ['Section', 'Total Questions', 'Question Types', 'Description'],
    ['VIBEMatch Assessment', vibematchQuestions.length.toString(), 'Likert Scale (14), Subjective (1)', 'Career interest inventory based on RIASEC model'],
    ['EduStats Assessment', edustatsQuestions.length.toString(), 'Single Choice, Multiple Choice, Subjective, Numeric Grid', 'Educational background and contextual information'],
    [''],
    ['QUESTION TYPE LEGEND'],
    [''],
    ['Type', 'Description', 'Example'],
    ['likert', '5-point scale from Strongly Disagree to Strongly Agree', 'Rate your agreement with statements'],
    ['single', 'Single choice selection from options', 'Select one option from a list'],
    ['multi', 'Multiple choice selection (check all that apply)', 'Select all that apply'],
    ['subjective', 'Open-ended text response', 'Describe in 2-3 sentences'],
    ['numeric-grid', 'Grid of numeric inputs', 'Enter grades for each subject'],
    [''],
    ['RIASEC MODEL (VIBEMatch)'],
    [''],
    ['Code', 'Type', 'Description'],
    ['R', 'Realistic', 'Hands-on, practical, mechanical interests'],
    ['I', 'Investigative', 'Analytical, scientific, problem-solving interests'],
    ['A', 'Artistic', 'Creative, expressive, aesthetic interests'],
    ['S', 'Social', 'Helping, teaching, collaborative interests'],
    ['E', 'Enterprising', 'Leading, persuading, entrepreneurial interests'],
    ['C', 'Conventional', 'Organized, detail-oriented, procedural interests']
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(summaryData);
  ws3['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 50 },
    { wch: 50 }
  ];

  XLSX.utils.book_append_sheet(wb, ws3, 'Overview');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `Naviksha_Test_Questions_${new Date().toISOString().split('T')[0]}.xlsx`);
};
