/**
 * PDF Generation Service using html-pdf
 * Renders HTML templates to PDF - fast, accurate, no browser overhead
 * Uses the new design templates from puppeteer-ms
 */

import express from 'express';
import cors from 'cors';
import htmlPdf from 'html-pdf';
import handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5100;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static assets
// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'templates/assets')));

// Register Handlebars helpers
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});
handlebars.registerHelper('gt', function (a, b) {
  return a > b;
});
handlebars.registerHelper('add', function (a, b) {
  return a + b;
});
handlebars.registerHelper('inc', function (value) {
  return parseInt(value) + 1;
});
handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});
handlebars.registerHelper('get', function (obj, prop) {
  return obj && obj[prop];
});


/**
 * Load HTML template
 */
/**
 * Load and compile HTML template
 */
function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, `templates/${templateName}.html`);
  try {
    const source = fs.readFileSync(templatePath, 'utf-8');
    return handlebars.compile(source);
  } catch (err) {
    console.error(`Error loading template ${templateName}:`, err.message);
    return handlebars.compile('');
  }
}

/**
 * Generate PDF from HTML
 */
function renderHtmlToPdf(html) {
  return new Promise((resolve, reject) => {
    const options = {
      format: 'A4',
      base: `file://${path.join(__dirname, 'templates')}/`, // Ensure local assets are loaded
      border: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      paginationOffset: 1,
      footer: {
        height: '0mm',
      },
      timeout: 30000,
    };

    htmlPdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}

/**
 * POST /generate-pdf
 * Expects JSON body with report data
 */
app.post('/generate-pdf', async (req, res) => {
  try {
    const reportData = req.body;

    if (!reportData) {
      return res.status(400).json({ error: 'No report data provided' });
    }

    console.log(`📄 Generating PDF for student: ${reportData.studentName || 'Unknown'}`);
    const startTime = Date.now();

    // Generate all 6 pages
    const pages = [];

    // Page 1: Cover/Student Card
    try {
      const page1Template = loadTemplate('page1');
      const page1Html = page1Template(reportData);
      const pdf1 = await renderHtmlToPdf(page1Html);
      pages.push(pdf1);
      console.log('✅ Page 1 (Cover) generated');
    } catch (err) {
      console.error('❌ Error generating Page 1:', err.message);
    }

    // Page 2: RIASEC Profile
    try {
      const page2Template = loadTemplate('page2');
      // Pre-calculate RIASEC percentages for the template if needed, 
      // but Handlebars can also handle simple logic.
      // For now, passing reportData directly.
      const page2Html = page2Template(reportData);
      const pdf2 = await renderHtmlToPdf(page2Html);
      pages.push(pdf2);
      console.log('✅ Page 2 (RIASEC Profile) generated');
    } catch (err) {
      console.error('❌ Error generating Page 2:', err.message);
    }

    // Page 3: Career Recommendations (part 1)
    try {
      const page3Template = loadTemplate('page3');
      const page3Html = page3Template(reportData);
      const pdf3 = await renderHtmlToPdf(page3Html);
      pages.push(pdf3);
      console.log('✅ Page 3 (Career Recommendations Part 1) generated');
    } catch (err) {
      console.error('❌ Error generating Page 3:', err.message);
    }

    // Page 4: Career Recommendations (part 2)
    try {
      const page4Template = loadTemplate('page4');
      const page4Html = page4Template(reportData);
      const pdf4 = await renderHtmlToPdf(page4Html);
      pages.push(pdf4);
      console.log('✅ Page 4 (Career Recommendations Part 2) generated');
    } catch (err) {
      console.error('❌ Error generating Page 4:', err.message);
    }

    // Page 5: Career Recommendations (part 3)
    try {
      const page5Template = loadTemplate('page5');
      const page5Html = page5Template(reportData);
      const pdf5 = await renderHtmlToPdf(page5Html);
      pages.push(pdf5);
      console.log('✅ Page 5 (Career Recommendations Part 3) generated');
    } catch (err) {
      console.error('❌ Error generating Page 5:', err.message);
    }

    // Page 6: Thank You
    try {
      const page6Template = loadTemplate('page6');
      const page6Html = page6Template(reportData);
      const pdf6 = await renderHtmlToPdf(page6Html);
      pages.push(pdf6);
      console.log('✅ Page 6 (Thank You) generated');
    } catch (err) {
      console.error('❌ Error generating Page 6:', err.message);
    }

    if (pages.length === 0) {
      return res.status(500).json({ error: 'No pages generated' });
    }

    // For single page, send directly. For multi-page, use pdf-merge library
    const finalPdf = pages[0];

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="career-report-${reportData.studentId || 'report'}.pdf"`);
    res.send(finalPdf);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`📄 PDF generated successfully in ${duration}s for: ${reportData.studentName}`);

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message
    });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'pdf-service',
    engine: 'html-pdf',
    templates: 'puppeteer-ms designs'
  });
});

app.listen(PORT, () => {
  console.log(`✅ PDF Service running on http://localhost:${PORT}`);
  console.log(`📄 POST /generate-pdf to generate PDF`);
  console.log(`🏥 GET /health for health check`);
  console.log(`⚡ Using html-pdf (fast, no browser overhead)`);
  console.log(`🎨 Templates location: ${path.join(__dirname, 'templates')}`);
});
