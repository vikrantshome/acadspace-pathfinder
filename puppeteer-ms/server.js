const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 5200;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok', service: 'Puppeteer-MS' });
});

/**
 * Generates a PDF buffer from a single HTML template file.
 * @param {string} templateName - The name of the HTML file in the 'templates' directory.
 * @returns {Promise<Buffer>} - A promise that resolves with the generated PDF buffer.
 */
async function generatePdfPage(templateName) {
    console.log(`Generating PDF page for: ${templateName}`);
    let browser;
    try {
        // 1. Read the HTML template
        const templatePath = path.join(__dirname, 'templates', templateName);
        let htmlContent = await fs.readFile(templatePath, 'utf8');

        // 2. Embed images as Base64 data URLs
        // This regex finds all src attributes with relative paths to the assets folder
        const imageSrcRegex = /src="\.\/assets\/([^"]+)"/g;
        const promises = [];
        let match;

        while ((match = imageSrcRegex.exec(htmlContent)) !== null) {
            const imagePath = path.join(__dirname, 'templates', 'assets', match[1]);
            const originalSrc = match[0]; // e.g., src="./assets/page1/compass.png"
            
            promises.push(
                fs.readFile(imagePath, 'base64').then(base64 => {
                    const extension = path.extname(imagePath).substring(1);
                    const dataUrl = `data:image/${extension};base64,${base64}`;
                    htmlContent = htmlContent.replace(originalSrc, `src="${dataUrl}"`);
                }).catch(err => console.error(`Could not read image ${imagePath}:`, err))
            );
        }
        await Promise.all(promises);

        // 3. Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // 4. Set content and generate PDF
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
        }
        console.log(`Finished generating PDF page for: ${templateName}`);
    }
}

// Main PDF generation endpoint
app.get('/generate-pdf', async (req, res) => {
    console.log('Received request to generate multi-page PDF...');
    try {
        const templates = ['page1.html', 'page2.html', 'page3.html', 'page4.html', 'page5.html'];

        // 1. Generate all PDF pages in parallel
        console.log('Generating individual PDF pages in parallel...');
        const pdfBuffers = await Promise.all(
            templates.map(template => generatePdfPage(template))
        );
        console.log('All individual pages generated.');

        // 2. Merge the PDF buffers
        console.log('Merging PDF pages...');
        const mergedPdf = await PDFDocument.create();
        for (const pdfBuffer of pdfBuffers) {
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        // 3. Save the merged PDF to a final buffer
        const mergedPdfBytes = await mergedPdf.save();
        console.log('PDFs merged successfully.');

        // 4. Send the final PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(mergedPdfBytes));

    } catch (error) {
        console.error('Error generating final PDF:', error);
        res.status(500).send({ error: 'Failed to generate final PDF', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Puppeteer microservice listening on port ${PORT}`);
});