const express = require('express');
const puppeteer = process.env.NODE_ENV === 'production' ? require('puppeteer-core') : require('puppeteer');
const chromium = require('@sparticuz/chromium');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 5200;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_4133800428-9nlcg87uct83fkpctgk5m8p4ut2h55v2.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const FOLDER_NAME = 'careerReports';

// RIASEC Descriptions
const RIASEC_DESCRIPTIONS = {
    "R": "Congratulations! You’ve scored highest in Realistic. You’re someone who learns best by doing and feels most confident when working with real-world objects, tools, or technologies. You enjoy solving practical problems and seeing clear, visible results from your efforts. You thrive in environments that are hands-on, active, and structured—where you can build, operate, repair, explore outdoors, or make systems work better. You excel in action-oriented work that brings ideas to life through physical creation and execution.",
    "I": "Congratulations! You’ve scored highest in Investigative. You love exploring the “why” and “how” behind everything, using logic, analysis, and curiosity as your strongest tools. You feel energized when researching, experimenting, or diving deep into complex topics. You thrive in environments that challenge your thinking—where you can analyze data, observe patterns, seek truth, and solve hard problems. You’re a natural explorer of ideas who finds purpose in uncovering deeper knowledge and meaning.",
    "A": "Congratulations! You’ve scored highest in Artistic. You are imaginative, expressive, and full of big ideas, often seeing beauty, emotion, and creativity where others see routine. You prefer freedom over rules and love shaping your thoughts into something original—through visuals, words, sound, movement, or design. You thrive in environments that embrace innovation, personal expression, and new perspectives. You’re meant for work where creativity leads the way and where your unique voice can truly shine.",
    "S": "Congratulations! You’ve scored highest in Social. You are warm, understanding, and naturally skilled at connecting with others. Helping, teaching, supporting, or guiding people gives you a sense of purpose. You thrive in places where communication, collaboration, and care are valued. You succeed in roles that allow you to build trust, listen deeply, and make a meaningful difference in the lives of individuals or communities. You’re a natural people champion.",
    "E": "Congratulations! You’ve scored highest in Enterprising. You’re confident, driven, and full of energy to lead, influence, and turn ideas into action. You enjoy taking charge, making decisions, and motivating others toward a common goal. You thrive in dynamic environments that reward initiative, strategy, and ambition. You’re suited to paths where you can persuade, lead, build, and create new opportunities—always moving forward with vision and courage.",
    "C": "Congratulations! You’ve scored highest in Conventional. You are organized, dependable, and great at transforming chaos into order. You enjoy working with systems, information, numbers, or processes—where accuracy and structure are important. You thrive in environments that are stable, methodical, and well-defined. You excel in tasks that involve planning, coordination, and maintaining smooth operations. You’re the one who keeps everything running efficiently and correctly."
};

async function uploadToDrive(pdfBuffer, filename) {
  try {
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
    const token = JSON.parse(await fs.readFile(TOKEN_PATH));

    const { client_secret, client_id } = credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      "http://localhost"
    );

    oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    // 1️⃣ Check if folder exists
    const folderSearch = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    let folderId;

    if (folderSearch.data.files.length > 0) {
      // folder exists
      folderId = folderSearch.data.files[0].id;
      console.log("📁 Existing folder found:", folderId);
    } else {
      // create folder
      const folderMetadata = {
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      folderId = folder.data.id;
      console.log("📁 Folder created:", folderId);
    }

    // 2️⃣ Upload file into that folder
    const fileMetadata = {
      name: filename,
      parents: [folderId],
    };

    const media = {
      mimeType: "application/pdf",
      body: require('stream').Readable.from(pdfBuffer),
    };

    console.log("⬆ Uploading PDF...");

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    const fileId = response.data.id;

    console.log("✔ Upload complete:", fileId);

    // 3️⃣ Make file public
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    console.log("🔗 Public URL:", publicUrl);

    return publicUrl;
  } catch (err) {
    console.error("❌ Error:", err);
    throw new Error('Failed to upload PDF to Google Drive');
  }
}


function getRiasecInsight(vibeScores) {
    if (!vibeScores || Object.keys(vibeScores).length === 0) {
        return "No RIASEC scores available to generate insights.";
    }

    let highestScore = -1;
    let highestRiasecType = '';

    for (const [riasecType, score] of Object.entries(vibeScores)) {
        if (score > highestScore) {
            highestScore = score;
            highestRiasecType = riasecType;
        }
    }
    
    // Fallback if for some reason highestRiasecType is still empty
    if (!highestRiasecType && Object.keys(vibeScores).length > 0) {
      highestRiasecType = Object.keys(vibeScores)[0]; // Just pick the first one
    }

    return RIASEC_DESCRIPTIONS[highestRiasecType] || "Unable to generate specific RIASEC insight.";
}


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok', service: 'Puppeteer-MS' });
});

/**
 * Populates a career template HTML with data from a specific career bucket.
 * @param {string} htmlContent - The HTML content of the template.
 * @param {string} bucketName - The name of the career bucket.
 * @  {number} bucketIndex - The index of the bucket (0-based).
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
        const studyPathHtml = career.studyPath.map(path => `<div class="bg-pill-bg px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700">${path}</div>`).join('<div class="text-header-blue text-base font-bold"> / </div>');
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
            <p class="text-[12px] text-gray-700 leading-snug line-clamp-5">${recommendationText}</p>
         </div>`
    );

    return htmlContent;
}


async function generateReportHTML(templateName, reportData, recommendations, studentID, studentName) {
    const templatePath = path.join(__dirname, 'templates', templateName);
    let htmlContent = await fs.readFile(templatePath, 'utf8');

    const data = reportData;
    const buckets = data.top5Buckets || data.top5_buckets;

    // Populate page1.html
    if (templateName === 'page1.html') {
        htmlContent = htmlContent.replace('Vikrant Rao', studentName || data.studentName || 'Student Name');
        htmlContent = htmlContent.replace('Student ID: <span class="font-bold">564890</span>', `Student ID: <span class="font-bold">${studentID || data.studentID || 'N/A'}</span>`);
        htmlContent = htmlContent.replace('St. Joseph English School', data.schoolName || 'School Name');
        htmlContent = htmlContent.replace('Grade 10 – CBSE', `Grade ${data.grade || 'N/A'} – ${data.board || 'N/A'}`);
    }

    // Populate page2.html
    if (templateName === 'page2.html') {
        htmlContent = htmlContent.replace(/Your profile shows that you enjoy structure[\s\S]*?and preparation pathways\./, data.summaryParagraph || '');
        const vibeScores = data.vibeScores || {};
        const riasecInsightText = getRiasecInsight(vibeScores);
        htmlContent = htmlContent.replace(/Your RIASEC results show a strong tilt toward[\s\S]*?and analytical exploration\./, riasecInsightText);
        htmlContent = htmlContent.replace('width: 72%', `width:${vibeScores.R || 0}%;`).replace('<span>72%</span>', `<span>${vibeScores.R || 0}%</span>`);
        htmlContent = htmlContent.replace('width: 56%', `width:${vibeScores.I || 0}%;`).replace('<span>56%</span>', `<span>${vibeScores.I || 0}%</span>`);
        htmlContent = htmlContent.replace('width: 91%', `width:${vibeScores.A || 0}%;`).replace('<span>91%</span>', `<span>${vibeScores.A || 0}%</span>`);
        htmlContent = htmlContent.replace('width: 76%', `width:${vibeScores.S || 0}%;`).replace('<span>76%</span>', `<span>${vibeScores.S || 0}%</span>`);
        htmlContent = htmlContent.replace('width: 62%', `width:${vibeScores.E || 0}%;`).replace('<span>62%</span>', `<span>${vibeScores.E || 0}%</span>`);
        htmlContent = htmlContent.replace('width: 48%', `width:${vibeScores.C || 0}%;`).replace('<span>48%</span>', `<span>${vibeScores.C || 0}%</span>`);
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
async function generatePdfPage(browser, templateName, reportData, recommendations, studentID, mobileNo, studentName) {
    console.log(`Generating PDF page for: ${templateName}`);
    let page;
    try {
        // 1. Generate HTML content dynamically
        let htmlContent = await generateReportHTML(templateName, reportData, recommendations, studentID, studentName);

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

        // 3. Create a new page
        page = await browser.newPage();

        // 4. Set content and generate PDF
        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 90000 });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        return pdfBuffer;
    } finally {
        if (page) {
            await page.close();
        }
        console.log(`Finished generating PDF page for: ${templateName}`);
    }
}

// Main PDF generation endpoint
app.post('/generate-pdf', async (req, res) => {
    console.log('Received POST request to generate multi-page PDF...');
    const { reportData, mobileNo, studentID, studentName } = req.body;

    if (!reportData) {
        return res.status(400).send({ error: 'Invalid report data provided in the request body.' });
    }

    let browser;
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
        const buckets = reportData.top5Buckets || reportData.top5_buckets;
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

        // 1. Launch the browser once
        const options = process.env.NODE_ENV === 'production' ? {
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        } : {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
        browser = await puppeteer.launch(options);

        // 2. Generate all PDF pages in parallel
        console.log('Generating individual PDF pages in parallel...');
        const pdfBuffers = await Promise.all(
            templates.map(template => generatePdfPage(browser, template, reportData, recommendations, studentID, mobileNo, studentName))
        );
        console.log('All individual pages generated.');

        // 3. Merge the PDF buffers
        console.log('Merging PDF pages...');
        const mergedPdf = await PDFDocument.create();
        for (const pdfBuffer of pdfBuffers) {
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        // 4. Save the merged PDF to a final buffer
        const mergedPdfBytes = await mergedPdf.save();
        console.log('PDFs merged successfully.');

        // 5. Generate unique filename
        const date = new Date().toISOString().slice(0, 10);
        const safeStudentName = (studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
        const safeStudentID = (studentID || '000000').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Career_Report_${safeStudentName}_${safeStudentID}_${date}.pdf`;

        // 6. Upload to Google Drive
        const publicUrl = await uploadToDrive(Buffer.from(mergedPdfBytes), filename);

        // 7. Send the public URL as a response
        res.status(200).send({ reportLink: publicUrl });

    } catch (error) {
        console.error('Error generating final PDF:', error);
        res.status(500).send({ error: 'Failed to generate final PDF', details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Puppeteer microservice listening on port ${PORT}`);
});