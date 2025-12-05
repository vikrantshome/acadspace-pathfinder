require('dotenv').config();
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { format } = require('@fast-csv/format');

const app = express();
const PORT = process.env.PORT || 3001; // Admin backend runs on 3001

// Create logs and failures directories if they don't exist
const logsDir = path.join(__dirname, 'logs');
const failuresDir = path.join(__dirname, 'failures');
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
if (!fs.existsSync(failuresDir)) {
    fs.mkdirSync(failuresDir);
}
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
}


// Logging function (enhanced for API errors)
const logApiError = (errorContext) => {
    const apiErrorsLogFile = path.join(logsDir, 'api_errors.log');
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp: timestamp,
        ...errorContext,
    };
    const logMessage = `${JSON.stringify(logEntry)}\n`;

    fs.appendFile(apiErrorsLogFile, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to API error log file:', err);
        }
    });
};

// Logging function for file upload/processing errors
const logUploadError = (logData) => {
    const logFilePath = path.join(logsDir, 'upload_errors.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${JSON.stringify(logData)}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/failures', express.static(path.join(__dirname, 'failures')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));


// CORS - for frontend to communicate
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Adjust in production
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Environment variables
const NAVIKSHA_BACKEND_URL = process.env.NAVIKSHA_BACKEND_URL || 'http://localhost:4000';

// Sample data for CSV download
const sampleCsvData = [
    {
        "studentId": "100001",
        "Date": "2025-01-15",
        "City": "Bangalore",
        "School Name": "ABC School",
        "Student Name": "Alice Smith",
        "Parent Name": "John Smith",
        "Contact": "9876543210",
        "Grade": "10"
    },
    {
        "studentId": "100002",
        "Date": "2025-01-15",
        "City": "Bangalore",
        "School Name": "XYZ Academy",
        "Student Name": "Bob Johnson",
        "Parent Name": "Jane Johnson",
        "Contact": "8765432109",
        "Grade": "11"
    },
    {
        "studentId": "100003",
        "Date": "2025-01-16",
        "City": "Delhi",
        "School Name": "Modern School",
        "Student Name": "Charlie Brown",
        "Parent Name": "Lucy Brown",
        "Contact": "7654321098",
        "Grade": "9"
    }
];


// API to handle CSV upload
app.post('/upload-students', upload.single('studentsCsv'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const filePath = path.join(__dirname, req.file.path);

    try {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                const processedStudents = [];
                const failedCases = [];

                for (const studentData of results) {
                    const studentId = studentData['studentId'];
                    try {
                        const studentName = studentData['Student Name'];
                        let contact = studentData['Contact'];
                        const grade = studentData['Grade'];
                        const parentName = studentData['Parent Name'];
                        const email = `student_${studentId}@naviksha.com`;

                        if (!contact || contact.trim().toLowerCase() === 'na' || contact.trim() === '') {
                            contact = studentId;
                        }

                        let userId = null;

                        try {
                            const requestBody = {
                                name: studentName,
                                email: email,
                                password: '123456',
                                mobileNo: contact,
                                studentID: studentId,
                                grade: grade,
                                parentName: parentName
                            };
                            const upsertResponse = await axios.post(`${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`, requestBody);
                            userId = upsertResponse.data.id;
                            console.log(`Upserted student ${studentId}: ${upsertResponse.data.message}`);
                            processedStudents.push({ studentId, status: 'success' });

                        } catch (upsertError) {
                            const errorReason = upsertError.response?.data?.message || upsertError.message;
                            logUploadError({
                                studentId,
                                endpoint: `${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`, // Explicitly log the API endpoint
                                message: `Failed to upsert student: ${errorReason}`,
                                requestConfig: upsertError.config,
                                responseData: upsertError.response?.data,
                                status: upsertError.response?.status,
                                stack: upsertError.stack
                            });
                            console.warn(`Error for ${studentId} during upsert: ${errorReason}`);
                            failedCases.push({ ...studentData, error: errorReason });
                            processedStudents.push({ studentId, status: 'failed', error: errorReason });
                        }

                    } catch (error) {
                        const errorReason = error.message;
                        logUploadError({
                            studentId,
                            message: `Error processing student data: ${errorReason}`,
                            originalStudentData: studentData,
                            stack: error.stack
                        });
                        console.error(`Error processing student ${studentId}: ${errorReason}`);
                        failedCases.push({ ...studentData, error: errorReason });
                        processedStudents.push({ studentId, status: 'failed', error: errorReason });
                    }
                }

                fs.unlinkSync(filePath);

                let failureFileUrl = null;
                if (failedCases.length > 0) {
                    const failureFileName = `failures_${Date.now()}.csv`;
                    const failureFilePath = path.join(failuresDir, failureFileName);
                    const csvStream = format({ headers: true });

                    const writeStream = fs.createWriteStream(failureFilePath);
                    csvStream.pipe(writeStream).on('end', () => console.log('Failure CSV written successfully.'));
                    
                    failedCases.forEach(row => csvStream.write(row));
                    csvStream.end();

                    failureFileUrl = `${req.protocol}://${req.get('host')}/failures/${failureFileName}`;
                }

                res.json({ 
                    message: 'CSV processed', 
                    summary: {
                        totalRows: results.length,
                        successCount: processedStudents.filter(s => s.status === 'success').length,
                        failureCount: failedCases.length,
                    },
                    failureFileUrl: failureFileUrl,
                    results: processedStudents 
                });
            });
    } catch (error) {
        logUploadError({
            message: `Error processing CSV file: ${error.message}`,
            filePath: filePath, // Include filePath for context
            stack: error.stack
        });
        console.error(`Error processing CSV: ${error.message}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ message: 'Error processing CSV', error: error.message });
    }
});

// API to download sample CSV
app.get('/download-sample-csv', (req, res) => {
    const csvFileName = `sample_students_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${csvFileName}"`);

    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    sampleCsvData.forEach(row => csvStream.write(row));
    csvStream.end();
});

// API to generate reports
app.post('/generate-reports', upload.single('omrData'), async (req, res) => {
    console.log('[/generate-reports] Received request to generate reports.');
    if (!req.file) {
        console.log('[/generate-reports] No file uploaded.');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const filePath = path.join(__dirname, req.file.path);
    console.log(`[/generate-reports] File uploaded: ${filePath}`);

    try {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
                console.log(`[/generate-reports] CSV data row: ${JSON.stringify(data)}`);
            })
            .on('end', async () => {
                console.log(`[/generate-reports] Finished reading CSV. Total rows: ${results.length}`);
                const summaryReportData = [];
                const failedCases = [];

                for (const studentData of results) {
                    const studentId = studentData['Student Code'];
                    console.log(`[/generate-reports] Processing student: ${studentId}`);
                    try {
                        const studentName = studentData['Student Name'];
                        let contact = studentData['Contact'];
                        const grade = studentData['Grade'];
                        const parentName = studentData['Parent Name'];
                        const email = `student_${studentId}@naviksha.com`;

                        if (!contact || contact.trim().toLowerCase() === 'na' || contact.trim() === '') {
                            contact = studentId;
                        }

                        console.log(`[/generate-reports] - Upserting student: ${studentId}`);
                        const upsertResponse = await axios.post(`${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`, {
                            name: studentName,
                            email: email,
                            password: '123456',
                            mobileNo: contact,
                            studentID: studentId,
                            grade: grade,
                            parentName: parentName
                        });
                        console.log(`[/generate-reports] - Upsert successful for ${studentId}: ${upsertResponse.data.message}`);
                        
                        const token = upsertResponse.data.token;
                        console.log(`[/generate-reports] - Received token for ${studentId}: ${token ? token.substring(0, 30) + '...' : 'No token'}`); // Log first 30 chars for brevity/security
                        const axiosWithAuth = axios.create({
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        const answers = {};
                        for (let i = 1; i <= 15; i++) { // Assuming Q1 to Q15
                            const questionId = `Q${i}`;
                            if (studentData[questionId]) {
                                answers[questionId] = studentData[questionId];
                            }
                        }
                        console.log(`[/generate-reports] - Answers prepared for ${studentId}: ${JSON.stringify(answers)}`);

                        console.log(`[/generate-reports] - Submitting test for student: ${studentId}`);
                        const submitResponse = await axiosWithAuth.post(`${NAVIKSHA_BACKEND_URL}/api/tests/combined/submit`, {
                            answers: answers
                        });
                        console.log(`[/generate-reports] - Test submission successful for ${studentId}. Report data: ${JSON.stringify(submitResponse.data.report)}`);
                        
                        const report = submitResponse.data.report;

                        console.log(`[/generate-reports] - Report generated for student: ${studentId}`);
                        
                        summaryReportData.push({
                            'Date': studentData['Date'],
                            'City': studentData['City'],
                            'School Name': studentName,
                            'Student Name': studentName,
                            'Parent Name': parentName,
                            'Contact': contact,
                            'Grade': grade,
                            'Report Link': report.reportLink,
                            'Career 1': report.careerMatches[0]?.careerBucket || '',
                            'Career 2': report.careerMatches[1]?.careerBucket || '',
                            'Career 3': report.careerMatches[2]?.careerBucket || '',
                            'studentId': studentId
                        });
                        console.log(`[/generate-reports] - Added ${studentId} to summaryReportData.`);

                    } catch (error) {
                        const errorReason = error.response?.data?.message || error.message;
                        logApiError({
                            studentId,
                            endpoint: `${NAVIKSHA_BACKEND_URL}/api/tests/combined/submit`, // This is the API endpoint that failed
                            message: `Report generation failed: ${errorReason}`,
                            requestConfig: error.config,
                            responseData: error.response?.data,
                            status: error.response?.status,
                            stack: error.stack,
                            // If it's an authentication error, log the token used
                            tokenAttempted: error.config?.headers?.Authorization ? error.config.headers.Authorization.substring(7) : 'N/A'
                        });
                        failedCases.push({ ...studentData, error: errorReason });
                        console.error(`[/generate-reports] - Error processing student ${studentId}: ${errorReason}`);
                        if (error.response?.data) {
                            console.error(`[/generate-reports] - Error response data for ${studentId}: ${JSON.stringify(error.response.data)}`);
                        }
                    }
                }
                
                fs.unlinkSync(filePath);
                console.log(`[/generate-reports] - Deleted temporary file: ${filePath}`);

                let summaryReportUrl = null;
                if (summaryReportData.length > 0) {
                    const summaryFileName = `summary_report_${Date.now()}.csv`;
                    const summaryFilePath = path.join(reportsDir, summaryFileName);
                    const csvStream = format({ headers: true });

                    const writeStream = fs.createWriteStream(summaryFilePath);
                    csvStream.pipe(writeStream).on('end', () => console.log('[/generate-reports] Summary report CSV written successfully.'));
                    
                    summaryReportData.forEach(row => csvStream.write(row));
                    csvStream.end();

                    summaryReportUrl = `${req.protocol}://${req.get('host')}/reports/${summaryFileName}`;
                    console.log(`[/generate-reports] Summary report URL: ${summaryReportUrl}`);
                }

                res.json({ 
                    message: 'Report generation process completed.',
                    summary: {
                        totalRows: results.length,
                        successCount: summaryReportData.length,
                        failureCount: failedCases.length,
                    },
                    summaryReportUrl: summaryReportUrl
                });
                console.log('[/generate-reports] Response sent.');
            });
    } catch (error) {
        logUploadError({
            message: `Top-level error processing OMR data file: ${error.message}`,
            stack: error.stack,
            filePath: filePath
        });
        console.error(`[/generate-reports] Top-level error processing file: ${error.message}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[/generate-reports] - Deleted temporary file in catch block: ${filePath}`);
        }
        res.status(500).json({ message: 'Error processing file', error: error.message });
        console.log('[/generate-reports] Error response sent.');
    }
});


app.listen(PORT, () => {
    console.log(`Admin backend running on port ${PORT}`);
});