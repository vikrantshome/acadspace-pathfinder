import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [omrFile, setOmrFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [uploadSummary, setUploadSummary] = useState(null);
    const [failureFileUrl, setFailureFileUrl] = useState(null);
    const [reportSummary, setReportSummary] = useState(null);
    const [summaryReportUrl, setSummaryReportUrl] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setUploadSummary(null);
        setFailureFileUrl(null);
    };

    const handleOmrFileChange = (event) => {
        setOmrFile(event.target.files[0]);
        setMessage('');
        setReportSummary(null);
        setSummaryReportUrl(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select a student data CSV file first.');
            return;
        }

        setUploading(true);
        setMessage('Uploading and processing students...');
        setUploadSummary(null);
        setFailureFileUrl(null);

        const formData = new FormData();
        formData.append('studentsCsv', selectedFile);

        try {
            const backendUrl = import.meta.env.VITE_ADMIN_BACKEND_URL || 'http://localhost:3001';
            const response = await axios.post(`${backendUrl}/upload-students`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data.message || 'File processed.');
            setUploadSummary(response.data.summary);
            setFailureFileUrl(response.data.failureFileUrl);
        } catch (error) {
            setMessage(`Upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setUploading(false);
            setSelectedFile(null);
        }
    };

    const handleGenerateReports = async () => {
        if (!omrFile) {
            setMessage('Please select an OMR data file first.');
            return;
        }

        setGenerating(true);
        setMessage('Generating reports...');
        setReportSummary(null);
        setSummaryReportUrl(null);
        
        const formData = new FormData();
        formData.append('omrData', omrFile);

        try {
            const backendUrl = import.meta.env.VITE_ADMIN_BACKEND_URL || 'http://localhost:3001';
            const response = await axios.post(`${backendUrl}/generate-reports`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data.message || 'Report generation process completed.');
            setReportSummary(response.data.summary);
            setSummaryReportUrl(response.data.summaryReportUrl);
        } catch (error) {
            setMessage(`Report generation failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setGenerating(false);
            setOmrFile(null);
        }
    };


    const handleDownloadSample = () => {
        const backendUrl = import.meta.env.VITE_ADMIN_BACKEND_URL || 'http://localhost:3001';
        window.open(`${backendUrl}/download-sample-csv`, '_blank');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Admin Dashboard</h1>
            </header>
            <main>
                <div className="module">
                    <h2>Student Upsert</h2>
                    <div className="upload-section">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
                            {uploading ? 'Processing...' : 'Upload & Upsert Students'}
                        </button>
                    </div>
                    <div className="sample-download">
                        <button onClick={handleDownloadSample}>Download Sample Student CSV</button>
                    </div>
                    {uploadSummary && (
                        <div className="summary">
                            <h3>Upload Summary</h3>
                            <p>Total Rows: {uploadSummary.totalRows}</p>
                            <p>Successful: {uploadSummary.successCount}</p>
                            <p>Failed: {uploadSummary.failureCount}</p>
                        </div>
                    )}
                    {failureFileUrl && (
                        <div className="failure-download">
                            <a href={failureFileUrl} download>Download Failed Student Cases</a>
                        </div>
                    )}
                </div>

                <hr />

                <div className="module">
                    <h2>Report Generation</h2>
                    <div className="upload-section">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleOmrFileChange}
                            disabled={generating}
                        />
                        <button onClick={handleGenerateReports} disabled={!omrFile || generating}>
                            {generating ? 'Generating...' : 'Generate Reports from OMR Data'}
                        </button>
                    </div>
                    {reportSummary && (
                        <div className="summary">
                            <h3>Report Generation Summary</h3>
                            <p>Total Rows: {reportSummary.totalRows}</p>
                            <p>Successful: {reportSummary.successCount}</p>
                            <p>Failed: {reportSummary.failureCount}</p>
                        </div>
                    )}
                    {summaryReportUrl && (
                        <div className="summary-download">
                            <a href={summaryReportUrl} download>Download Summary Report</a>
                        </div>
                    )}
                </div>

                {message && <p className="message">{message}</p>}
                
            </main>
        </div>
    );
}

export default App;