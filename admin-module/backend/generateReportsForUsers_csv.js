const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { format, writeToPath } = require('@fast-csv/format');
const csv = require('@fast-csv/parse');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load main .env

const NAVIKSHA_BACKEND_URL = process.env.NAVIKSHA_BACKEND_URL || 'http://localhost:4000';
const LOGS_DIR = path.join(__dirname, 'logs');
const API_ERRORS_LOG_FILE = path.join(LOGS_DIR, 'api_report_gen_errors.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Enhanced logging function for API errors during report generation
const logApiError = (errorContext) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp: timestamp,
        ...errorContext,
    };
    const logMessage = `${JSON.stringify(logEntry)}
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
            .pipe(csv.parse({ headers: true }))
            .on('error', reject)
            .on('data', (row) => usersData.push(row))
            .on('end', resolve);
    });

    const outputRows = [];
    const headers = [
        "Student Code", "Date", "City", "School Name", "Student Name",
        "Parent Name", "Contact", "Grade", "Report Link", "Career 1",
        "Career 2", "Career 3"
    ];
    outputRows.push(headers); // Add headers to the output

    const TEST_ID_VIBEMATCH = "vibematch";
    const TEST_ID_EDUSTATS = "edustats";

    for (const user of usersData) {
        const studentId = user['Student Code'];
        const email = user['Email'];
        const password = user.password || '123456'; // Default password
        const name = user['Student Name'];
        const mobileNo = user['Contact'];
        const grade = user['Grade'];
        const schoolName = user['School Name'];
        const city = user['City'];
        const createdAtDate = user['Date'];
        const board = user.board || 'CBSE'; // Default board

        let reportLink = 'N/A';
        let career1 = 'N/A';
        let career2 = 'N/A';
        let career3 = 'N/A';
        let userId = 'N/A';
        let authToken = null;

        try {
            // Step 1: Upsert/Login user to get a token and userId
            console.log(`Processing student ${studentId}: Upserting to get token...`);
            const upsertResponse = await axios.post(`${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`, {
                name: name,
                email: email,
                password: password,
                mobileNo: mobileNo,
                studentID: studentId,
                grade: grade,
                parentName: parentName,
                fullName: name, // Use name for fullName
                schoolName: schoolName,
                board: board,
                city: city
            });
            authToken = upsertResponse.data.token;
            userId = upsertResponse.data.user.id; // Correctly get userId
            console.log(`Successfully obtained token for ${studentId}.`);
        } catch (error) {
            console.error(`Error upserting/logging in ${studentId}: ${error.message}`);
            logApiError({
                studentId,
                endpoint: `${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`,
                message: `Failed to upsert/login student: ${error.message}`,
                requestConfig: error.config,
                responseData: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            outputRows.push([
                studentId, createdAtDate, city, schoolName, name, parentName, mobileNo, grade,
                'N/A', 'N/A', 'N/A', 'N/A' // All report-related fields as N/A
            ]);
            continue; // Skip to next student
        }

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
                // The rest of the report generation logic that depends on test answers
                // is omitted as the CSV does not contain test answer data.
                // If answer data is available elsewhere, this part needs to be adapted.
                console.log(`No test answers in CSV for ${studentId}. Cannot generate new report.`);
            }

        } catch (error) {
            console.error(`Error processing reports for ${studentId}: ${error.message}`);
            logApiError({
                studentId,
                endpoint: error.config?.url , // Log the specific failing endpoint
                message: `Failed to fetch/generate reports: ${error.message}`,
                requestConfig: error.config,
                responseData: error.response?.data,
                status: error.response?.status,
                stack: error.stack,
                tokenAttempted: authToken ? authToken.substring(0, 30) + '...' : 'N/A'
            });
        }
        
        outputRows.push([
            studentId, createdAtDate, city, schoolName, name, parentName, mobileNo, grade,
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
    const csvInputFilePath = path.join(__dirname, '../../3rd_Dec_NA_cases.csv');
    const csvOutputFilePath = path.join(__dirname, 'reports', `user_report_summary_from_csv_${new Date().toISOString().slice(0, 10)}.csv`);

    generateUserReportSummary(csvInputFilePath, csvOutputFilePath)
        .catch(err => {
            console.error("An unhandled error occurred during script execution:", err);
        });
}
