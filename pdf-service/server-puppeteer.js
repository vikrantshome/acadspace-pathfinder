import express from 'express';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5100;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
 * Generate PDF from HTML using Puppeteer
 */
async function generatePdfPage(browser, htmlContent) {
    const page = await browser.newPage();
    try {
        // Embed images as Base64 to ensure they render correctly
        const imageSrcRegex = /src="\.\/assets\/([^"]+)"/g;
        const promises = [];
        let match;
        let processedHtml = htmlContent;

        while ((match = imageSrcRegex.exec(htmlContent)) !== null) {
            const imagePath = path.join(__dirname, 'templates', 'assets', match[1]);
            const originalSrc = match[0];

            try {
                const base64 = fs.readFileSync(imagePath, 'base64');
                const extension = path.extname(imagePath).substring(1);
                const dataUrl = `data:image/${extension};base64,${base64}`;
                processedHtml = processedHtml.replace(originalSrc, `src="${dataUrl}"`);
            } catch (err) {
                console.error(`Could not read image ${imagePath}:`, err.message);
            }
        }

        await page.setContent(processedHtml, { waitUntil: 'networkidle0', timeout: 60000 });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        return pdfBuffer;
    } finally {
        await page.close();
    }
}

app.post('/generate-pdf', async (req, res) => {
    try {
        const reportData = req.body;

        if (!reportData) {
            return res.status(400).json({ error: 'No report data provided' });
        }

        // Normalize data
        if (!reportData.top5Buckets && reportData.top5_buckets) {
            reportData.top5Buckets = reportData.top5_buckets;
        }

        // Map vibeScores to riasecScores if missing
        if (!reportData.riasecScores && reportData.vibeScores) {
            reportData.riasecScores = reportData.vibeScores;
        }

        console.log(`📄 Generating PDF for student: ${reportData.studentName || 'Unknown'}`);
        const startTime = Date.now();

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const pages = [];
            // Generate introductory pages
            const introTemplates = ['page1', 'page2'];
            for (const templateName of introTemplates) {
                try {
                    const template = loadTemplate(templateName);
                    const html = template(reportData);
                    const pdfBuffer = await generatePdfPage(browser, html);
                    pages.push(pdfBuffer);
                    console.log(`✅ ${templateName} generated`);
                } catch (err) {
                    console.error(`❌ Error generating ${templateName}:`, err.message);
                }
            }

            // Generate career bucket pages dynamically
            if (reportData.top5Buckets && reportData.top5Buckets.length > 0) {
                const careerTemplate = loadTemplate('page_career');

                // Limit to Top 3 Buckets as per user request
                const bucketLimit = Math.min(reportData.top5Buckets.length, 3);

                for (let i = 0; i < bucketLimit; i++) {
                    try {
                        // Create a context with the current bucket and its rank
                        const bucketContext = {
                            ...reportData,
                            currentBucket: reportData.top5Buckets[i],
                            currentBucketRank: i + 1
                        };

                        const html = careerTemplate(bucketContext);
                        const pdfBuffer = await generatePdfPage(browser, html);
                        pages.push(pdfBuffer);
                        console.log(`✅ page_career (Bucket ${i + 1}) generated`);
                    } catch (err) {
                        console.error(`❌ Error generating page_career for Bucket ${i + 1}:`, err.message);
                    }
                }
            }

            // Generate closing page
            try {
                const template = loadTemplate('page6');
                const html = template(reportData);
                const pdfBuffer = await generatePdfPage(browser, html);
                pages.push(pdfBuffer);
                console.log(`✅ page6 generated`);
            } catch (err) {
                console.error(`❌ Error generating page6:`, err.message);
            }

            // Merge PDFs
            if (pages.length === 0) {
                throw new Error('No pages were generated successfully');
            }

            const mergedPdf = await PDFDocument.create();
            for (const pdfBuffer of pages) {
                const pdf = await PDFDocument.load(pdfBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const buffer = Buffer.from(mergedPdfBytes);

            console.log(`🎉 PDF generated successfully in ${Date.now() - startTime}ms`);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Career_Report_${(reportData.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            res.send(buffer);

        } finally {
            await browser.close();
        }

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'pdf-service-puppeteer' });
});

app.listen(PORT, () => {
    console.log(`🚀 PDF Service (Puppeteer) running on port ${PORT}`);
});
