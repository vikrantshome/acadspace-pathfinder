const express = require('express');
const puppeteer = process.env.NODE_ENV === 'production' ? require('puppeteer-core') : require('puppeteer');
const chromium = require('@sparticuz/chromium');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5200;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok', service: 'Puppeteer-MS' });
});

/**
 * Populates a career template HTML with data from a specific career bucket.
 * @param {string} htmlContent - The HTML content of the template.
 * @param {string} bucketName - The name of the career bucket.
 * @param {number} bucketIndex - The index of the bucket (0-based).
 * @param {Array<object>} careersToRender - An array of career objects to render on this page.
 * @param {object} reportData - The full report data for accessing shared info like skills.
 * @returns {string} - The populated HTML string.
 */
function populateCareerPage(htmlContent, bucketName, bucketIndex, careersToRender, reportData, recommendations) {
    if (!bucketName || !careersToRender || careersToRender.length === 0) {
        // If there's no data, hide the career cards section
        return htmlContent.replace(/<div class="flex-grow flex flex-col gap-5">[\s\S]*<div class="bg-bg-prep/, '<div class="flex-grow"></div><div class="bg-bg-prep');
    }

    // Populate bucket name
    htmlContent = htmlContent.replace(/>\s*\d\.\s*Business Finance & Consulting\s*</, `> ${bucketIndex + 1}. ${bucketName} <`);

    // Dynamically generate career cards
    const careerCardsHtml = careersToRender.map((career, index) => {
        const studyPathHtml = career.studyPath.map(path => `<div class="bg-pill-bg px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700">${path}</div>`).join('<div class="text-header-blue text-base font-bold">&rarr;</div>');
        const choice = ['1st', '2nd', '3rd', '4th', '5th'][index] || `${index + 1}th`;
        
        return `
        <div class="bg-white rounded-2xl p-4 shadow-soft">
            <div class="flex items-center mb-2">
                <div class="w-[6px] h-[28px] bg-header-blue rounded mr-4"></div>
                <div class="text-xl font-bold text-header-blue leading-none">
                    ${career.careerName} <span class="text-lg font-bold ml-2 text-green-success">${choice} Choice</span>
                </div>
            </div>
            <div class="text-[13px] mb-1 pl-5 text-gray-700 leading-normal">
                <strong class="text-gray-900">Why This Fits:</strong> ${career.topReasons.join(' ')}
            </div>
            <div class="flex items-center mb-2 pl-5">
                <div class="font-bold text-[13px] mr-4 text-gray-900">Study Path:</div>
                <div class="flex items-center gap-2 flex-wrap">${studyPathHtml}</div>
            </div>
            <div class="bg-yellow-bg rounded-lg p-3 border border-yellow-border">
                <div class="flex items-center text-header-blue font-bold text-xs mb-1.5">
                    <span class="mr-2 text-sm">💡</span> 
                    <span class="mr-1">Pro Tip by</span>
                    <img src="./assets/footer_logo.png" alt="ALLEN ONLINE" class="h-[14px] w-auto mx-1 inline-block align-middle">
                    <span>Experts</span>
                </div>
                <div class="text-[11px] text-gray-600 pl-7 leading-relaxed">
                    To excel in this career,
                    <div class="flex flex-wrap items-baseline gap-1 mt-2">
                        <h5 class="font-bold">top skills you must develop:</h5>
                        ${(career.recommendedSkills || []).map(skill => `<span class="bg-pill-bg px-2 py-0.5 rounded-full text-xs font-semibold text-slate-700">${skill}</span>`).join('')}
                    </div>
                    <div class="flex flex-wrap items-baseline gap-1 mt-2">
                        <h5 class="font-bold">Courses recommended for you:</h5>
                        ${(career.recommendedCourses || []).map(course => `<span class="bg-pill-bg px-2 py-0.5 rounded-full text-xs font-semibold text-slate-700">${course}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('<div class="my-2"></div>');

    const cardsRegex = /<div class="flex-grow flex flex-col gap-5">([\s\S]*)<div class="bg-bg-prep/;
    htmlContent = htmlContent.replace(cardsRegex, `<div class="flex-grow flex flex-col">
        ${careerCardsHtml}
    <div class="bg-bg-prep`);

    // Populate the new single recommendation block
    const recommendationText = recommendations[bucketName] || "No recommendation available for this category.";
    htmlContent = htmlContent.replace(
        /<div class="bg-white rounded-xl p-4 h-full shadow-sm border border-slate-50 recommendation-content">[\s\S]*?<\/div>/,
        `<div class="bg-white rounded-xl p-4 h-full shadow-sm border border-slate-50 recommendation-content">
            <p class="text-[12px] text-gray-700 leading-snug">${recommendationText}</p>
         </div>`
    );

    return htmlContent;
}


async function generateReportHTML(templateName, reportData, recommendations) {
    const templatePath = path.join(__dirname, 'templates', templateName);
    let htmlContent = await fs.readFile(templatePath, 'utf8');

    const data = reportData.reportData;
    const buckets = data.top5Buckets || data.top5_buckets;

    // Populate page1.html
    if (templateName === 'page1.html') {
        htmlContent = htmlContent.replace('Vikrant Rao', data.studentName || 'Student Name');
        htmlContent = htmlContent.replace('Student ID: <span class="font-bold">564890</span>', `Student ID: <span class="font-bold">${reportData.userId.slice(-6) || 'N/A'}</span>`);
        htmlContent = htmlContent.replace('St. Joseph English School', data.schoolName || 'School Name');
        htmlContent = htmlContent.replace('Grade 10 – CBSE', `Grade ${data.grade || 'N/A'} – ${data.board || 'N/A'}`);
    }

    // Populate page2.html
    if (templateName === 'page2.html') {
        htmlContent = htmlContent.replace(/Your profile shows that you enjoy structure[\s\S]*?and preparation pathways\./, data.summaryParagraph || '');
        htmlContent = htmlContent.replace(/Your RIASEC results show a strong tilt toward[\s\S]*?and analytical exploration\./, data.detailedCareerInsights?.explanations?.[buckets?.[0]?.topCareers?.[0]?.careerName] || '');
        
        const vibeScores = data.vibeScores || {};
        htmlContent = htmlContent.replace('width:72%;', `width:${vibeScores.R || 0}%;`).replace('<span>72%</span>', `<span>${vibeScores.R || 0}%</span>`);
        htmlContent = htmlContent.replace('width:56%;', `width:${vibeScores.I || 0}%;`).replace('<span>56%</span>', `<span>${vibeScores.I || 0}%</span>`);
        htmlContent = htmlContent.replace('width:91%;', `width:${vibeScores.A || 0}%;`).replace('<span>91%</span>', `<span>${vibeScores.A || 0}%</span>`);
        htmlContent = htmlContent.replace('width:76%;', `width:${vibeScores.S || 0}%;`).replace('<span>76%</span>', `<span>${vibeScores.S || 0}%</span>`);
        htmlContent = htmlContent.replace('width:62%;', `width:${vibeScores.E || 0}%;`).replace('<span>62%</span>', `<span>${vibeScores.E || 0}%</span>`);
        htmlContent = htmlContent.replace('width:48%;', `width:${vibeScores.C || 0}%;`).replace('<span>48%</span>', `<span>${vibeScores.C || 0}%</span>`);
    }

    // Populate career pages
    if (templateName === 'page3.html') {
        const bucket = buckets?.[0];
        const careers = bucket?.topCareers?.slice(0, 2);
        htmlContent = populateCareerPage(htmlContent, bucket?.bucketName, 0, careers, data, recommendations);
    }
    if (templateName === 'page4.html') {
        const bucket = buckets?.[1];
        const careers = bucket?.topCareers?.slice(0, 2);
        htmlContent = populateCareerPage(htmlContent, bucket?.bucketName, 1, careers, data, recommendations);
    }
    if (templateName === 'page5.html') {
        const bucket = buckets?.[2];
        const careers = bucket?.topCareers?.slice(0, 2);
        htmlContent = populateCareerPage(htmlContent, bucket?.bucketName, 2, careers, data, recommendations);
    }
    if (templateName === 'page6.html') {
        const bucket = buckets?.[3];
        const careers = bucket?.topCareers?.slice(0, 2);
        htmlContent = populateCareerPage(htmlContent, bucket?.bucketName, 3, careers, data, recommendations);
    }

    return htmlContent;
}


/**
 * Generates a PDF buffer from a single HTML template file.
 * @param {string} templateName - The name of the HTML file in the 'templates' directory.
 * @param {object} reportData - The StudentReport JSON object.
 * @param {object} recommendations - The AO recommendations JSON object.
 * @returns {Promise<Buffer>} - A promise that resolves with the generated PDF buffer.
 */
async function generatePdfPage(templateName, reportData, recommendations) {
    console.log(`Generating PDF page for: ${templateName}`);
    let browser;
    try {
        // 1. Generate HTML content dynamically
        let htmlContent = await generateReportHTML(templateName, reportData, recommendations);

        // 2. Embed images as Base64 data URLs
        const imageSrcRegex = /src="\.\/assets\/([^"]+)"/g;
        const promises = [];
        let match;

        while ((match = imageSrcRegex.exec(htmlContent)) !== null) {
            const imagePath = path.join(__dirname, 'templates', 'assets', match[1]);
            const originalSrc = match[0];
            
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
        const options = process.env.NODE_ENV === 'production' ? {
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        } : {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
        browser = await puppeteer.launch(options);
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
app.post('/generate-pdf', async (req, res) => {
    console.log('Received POST request to generate multi-page PDF...');
    const reportData = req.body;

    if (!reportData || !reportData.reportData) {
        return res.status(400).send({ error: 'Invalid report data provided in the request body.' });
    }

    try {
        // Load recommendations
        const recommendationsPath = path.join(__dirname, 'ao_recommendations.json');
        console.log('Loading recommendations from:', recommendationsPath);
        const recommendationsData = await fs.readFile(recommendationsPath, 'utf8');
        const recommendations = JSON.parse(recommendationsData);
        console.log('Recommendations loaded successfully.');

        // Load career data from naviksha.careers.json
        const careersPath = path.join(__dirname, 'naviksha.careers.json');
        console.log('Loading careers from:', careersPath);
        const careersData = await fs.readFile(careersPath, 'utf8');
        const careers = JSON.parse(careersData);
        console.log('Careers loaded successfully.');

        // Load career data from naviksha.careers.json
        const careersMap = new Map(careers.map(career => [career.careerName, career]));

        // Add recommendedSkills and recommendedCourses to the reportData
        const buckets = reportData.reportData.top5Buckets || reportData.reportData.top5_buckets;
        if (buckets) {
            for (const bucket of buckets) {
                if (bucket.topCareers) {
                    for (const career of bucket.topCareers) {
                        const careerData = careersMap.get(career.careerName);
                        if (careerData) {
                            career.recommendedSkills = careerData.recommendedSkills;
                            career.recommendedCourses = careerData.recommendedCourses;
                        }
                    }
                }
            }
        }

        const templates = ['page1.html', 'page2.html', 'page3.html', 'page4.html', 'page5.html', 'page6.html'];

        // 1. Generate all PDF pages in parallel
        console.log('Generating individual PDF pages in parallel...');
        const pdfBuffers = await Promise.all(
            templates.map(template => generatePdfPage(template, reportData, recommendations))
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