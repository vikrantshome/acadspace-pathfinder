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
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
if (!fs.existsSync(failuresDir)) {
    fs.mkdirSync(failuresDir);
}


// Logging function
const logError = (logData) => {
    const logFilePath = path.join(logsDir, 'upload_errors.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${JSON.stringify(logData)}
`;
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
                            const errorData = {
                                studentId,
                                error: `Failed to upsert student: ${errorReason}`,
                            };
                            logError({ ...errorData, request: upsertError.config, response: upsertError.response?.data });
                            console.warn(errorData.error);
                            failedCases.push({ ...studentData, error: errorReason });
                            processedStudents.push({ studentId, status: 'failed', error: errorReason });
                        }

                    } catch (error) {
                        const errorReason = error.message;
                        const errorData = {
                            studentId,
                            error: `Error processing student: ${errorReason}`,
                            originalStudentData: studentData,
                        };
                        logError(errorData);
                        console.error(errorData.error);
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
        const errorData = {
            error: `Error processing CSV file: ${error.message}`,
        };
        logError(errorData);
        console.error(errorData.error);
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

app.listen(PORT, () => {
    console.log(`Admin backend running on port ${PORT}`);
});
