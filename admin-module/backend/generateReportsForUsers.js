const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { format, writeToPath } = require('@fast-csv/format');
const csv = require('csv-parser');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load main .env

const NAVIKSHA_BACKEND_URL = process.env.NAVIKSHA_BACKEND_URL || 'http://localhost:4000';
const LOGS_DIR = path.join(__dirname, 'logs');
const API_ERRORS_LOG_FILE = path.join(LOGS_DIR, 'api_report_gen_errors.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Function to handle circular references in JSON
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    };
};

// Enhanced logging function for API errors during report generation
const logApiError = (errorContext) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp: timestamp,
        ...errorContext,
    };
    const logMessage = `${JSON.stringify(logEntry, getCircularReplacer(), 2)}
`;

    fs.appendFile(API_ERRORS_LOG_FILE, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to API error log file:', err);
        }
    });
};

async function generateUserReportSummary(csvInputFilePath, csvOutputFilePath) {
    const usersData = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(csvInputFilePath)
            .pipe(csv())
            .on('data', (data) => usersData.push(data))
            .on('error', (err) => reject(err))
            .on('end', () => {
                resolve();
            });
    });

    const outputRows = [];
    const headers = [
        "Student Code", "Date", "City", "School Name", "Student Name",
        "Email", "Contact", "Grade", "Report Link", "Career 1",
        "Career 2", "Career 3"
    ];
    outputRows.push(headers); // Add headers to the output

    const TEST_ID_VIBEMATCH = "vibematch";
    const TEST_ID_EDUSTATS = "edustats";

    for (const user of usersData) {
        const studentId = user['Student Code'];
        
        let authToken = null;
        let userId = null;
        let userDataFromApi = null;

        try {
            console.log(`Processing student ${studentId}: Looking up user...`);
            const lookupResponse = await axios.post(`${NAVIKSHA_BACKEND_URL}/api/auth/lookup`, {
                studentID: studentId
            });

            authToken = lookupResponse.data.token;
            userDataFromApi = lookupResponse.data.user;
            userId = userDataFromApi.id;
            
            console.log(`Successfully looked up user ${studentId}.`);

        } catch (error) {
            console.error(`Error looking up user ${studentId}: ${error.message}`);
            logApiError({
                studentId,
                endpoint: `${NAVIKSHA_BACKEND_URL}/api/auth/lookup`,
                message: `Failed to lookup user: ${error.message}`,
                requestConfig: {
                    method: error.config?.method,
                    url: error.config?.url,
                    headers: error.config?.headers
                },
                responseData: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            outputRows.push([
                studentId, user['Date'], user['City'], user['School Name'], user['Student Name'], user['Email'], user['Contact'], user['Grade'],
                'Lookup Failed', 'N/A', 'N/A', 'N/A'
            ]);
            continue;
        }

        const {
            name, email, grade, schoolName, city, board, createdAt
        } = userDataFromApi;

        let createdAtDate = 'N/A';
        if (createdAt) {
            try {
                const dt_object = new Date(createdAt);
                createdAtDate = dt_object.toLocaleDateString('en-GB');
            } catch (e) {
                console.warn(`Could not parse createdAt date for studentID ${studentId}: ${e.message}`);
            }
        }

        let reportLink = 'N/A';
        let career1 = 'N/A';
        let career2 = 'N/A';
        let career3 = 'N/A';

        try {
            // Step 2: Try to fetch existing reports
            console.log(`Fetching reports for student ${studentId} (userId: ${userId})...`);
            const reportsResponse = await axios.get(`${NAVIKSHA_BACKEND_URL}/api/reports/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const reports = reportsResponse.data;
            let foundReportWithLink = false;
            if (reports && reports.length > 0) {
                const reportWithLink = reports.find(r => r.reportLink);
                if (reportWithLink) {
                    reportLink = reportWithLink.reportLink;
                    if (reportWithLink.reportData && reportWithLink.reportData.top5Buckets && reportWithLink.reportData.top5Buckets.length > 0) {
                        career1 = reportWithLink.reportData.top5Buckets[0].bucketName ;
                        career2 = reportWithLink.reportData.top5Buckets[1]?.bucketName ;
                        career3 = reportWithLink.reportData.top5Buckets[2]?.bucketName ;
                    }
                    foundReportWithLink = true;
                    console.log(`Reports fetched for ${studentId}. Link: ${reportLink}`);
                }
            }

            // Step 3: If no report link, attempt to generate
            if (!foundReportWithLink) {
                console.log(`No existing report link found for ${studentId}. Attempting to generate new report...`);
                
                const vibematchProgressResponse = await axios.get(`${NAVIKSHA_BACKEND_URL}/api/progress/${userId}?testId=${TEST_ID_VIBEMATCH}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const vibematchProgress = vibematchProgressResponse.data;

                const edustatsProgressResponse = await axios.get(`${NAVIKSHA_BACKEND_URL}/api/progress/${userId}?testId=${TEST_ID_EDUSTATS}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const edustatsProgress = edustatsProgressResponse.data;

                let combinedAnswers = {};
                let subjectScores = {};
                let extracurriculars = [];
                let parentCareers = [];
                let studyAbroadPreference = null;
                let workStylePreference = null;


                if (vibematchProgress && vibematchProgress.answers) {
                    Object.assign(combinedAnswers, vibematchProgress.answers);
                }
                if (edustatsProgress && edustatsProgress.answers) {
                    const answers = edustatsProgress.answers;
                    Object.assign(combinedAnswers, answers);
                    
                    subjectScores = answers.e_04 || {};
                    extracurriculars = answers.e_06 || [];
                    parentCareers = answers.e_07 || [];
                    workStylePreference = answers.e_11 || null;

                    if (answers.e_09) {
                        const answer_e09 = (answers.e_09 || '').toLowerCase();
                        studyAbroadPreference = answer_e09.includes('yes') || answer_e09.includes('definitely');
                    }
                }

                console.log("request for /api/tests/combined/submit : ", {
                        answers: combinedAnswers,
                        board: board,
                        grade: grade,
                        userName: name,
                        subjectScores: subjectScores,
                        extracurriculars: extracurriculars,
                        parentCareers: parentCareers,
                        studyAbroadPreference: studyAbroadPreference,
                        workStylePreference: workStylePreference
                    });
                

                if (Object.keys(combinedAnswers).length > 0) {
                    console.log(`Found test progress with answers for ${studentId}. Submitting combined test...`);
                    const submitResponse = await axios.post(`${NAVIKSHA_BACKEND_URL}/api/tests/combined/submit`, {
                        answers: combinedAnswers,
                        board: board,
                        grade: grade,
                        userName: name,
                        subjectScores: subjectScores,
                        extracurriculars: extracurriculars,
                        parentCareers: parentCareers,
                        studyAbroadPreference: studyAbroadPreference,
                        workStylePreference: workStylePreference
                    }, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });

                    console.log("check response for combined/submit : ", JSON.stringify(submitResponse.data));
                    

                    const report = submitResponse.data.report;
                    if (report && report.reportLink) {
                        reportLink = report.reportLink;
                    }
                    if (report && report.top5Buckets && report.top5Buckets.length > 0) {
                        career1 = report.top5Buckets[0].bucketName ;
                        career2 = report.top5Buckets[1]?.bucketName ;
                        career3 = report.top5Buckets[2]?.bucketName ;
                    }
                    console.log(`Successfully generated new report for ${studentId}. Link: ${reportLink}`);
                } else {
                    console.log(`No test progress or answers found for ${studentId} for vibematch or edustats. Cannot generate report.`);
                }
            }

        } catch (error) {
            console.error(`Error processing reports for ${studentId}: ${error.message}`);
            logApiError({
                studentId,
                endpoint: error.config?.url , // Log the specific failing endpoint
                message: `Failed to fetch/generate reports: ${error.message}`,
                requestConfig: {
                    method: error.config?.method,
                    url: error.config?.url,
                    headers: error.config?.headers
                },
                responseData: error.response?.data,
                status: error.response?.status,
                stack: error.stack,
                tokenAttempted: authToken ? authToken.substring(0, 30) + '...' : 'N/A'
            });
        }
        
        outputRows.push([
            studentId, createdAtDate, city, schoolName, name, email, user['Contact'], grade,
            reportLink, career1, career2, career3
        ]);
    }

    // DEBUG: Save outputRows as JSON for inspection
    const debugJsonFilePath = csvOutputFilePath.replace('.csv', '_DEBUG.json');
    try {
        fs.writeFileSync(debugJsonFilePath, JSON.stringify(outputRows, null, 2), 'utf-8');
        console.log(`DEBUG: outputRows saved as JSON at ${debugJsonFilePath}`);
    } catch (jsonErr) {
        console.error('DEBUG: Error writing debug JSON file:', jsonErr);
    }

    // Write to CSV
    try {
        await writeToPath(csvOutputFilePath, outputRows, { headers: false });
        console.log(`CSV summary successfully generated at ${csvOutputFilePath}`);
    } catch (err) {
        console.error('Error writing CSV file:', err);
        throw err;
    }
}

if (require.main === module) {
    if (process.argv.length < 3) {
        console.error('Usage: node generateReportsForUsers.js <path_to_csv_file>');
        process.exit(1);
    }
    const csvInputFilePath = process.argv[2];
    const outputFileName = path.basename(csvInputFilePath, '.csv');
    const csvOutputFilePath = path.join(__dirname, 'reports', `${outputFileName}_report_summary_${new Date().toISOString().slice(0, 10)}.csv`);

    generateUserReportSummary(csvInputFilePath, csvOutputFilePath)
        .catch(err => {
            console.error("An unhandled error occurred during script execution:", err);
        });
}
