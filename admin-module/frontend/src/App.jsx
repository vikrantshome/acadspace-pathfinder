import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadSummary, setUploadSummary] = useState(null);
    const [failureFileUrl, setFailureFileUrl] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setUploadSummary(null);
        setFailureFileUrl(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select a CSV file first.');
            return;
        }

        setUploading(true);
        setMessage('Uploading and processing...');
        setUploadSummary(null);
        setFailureFileUrl(null);

        const formData = new FormData();
        formData.append('studentsCsv', selectedFile);

        try {
            const backendUrl = import.meta.env.VITE_ADMIN_BACKEND_URL || 'http://localhost:3001';
            const response = await axios.post(`${backendUrl}/upload-students`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message || 'File processed.');
            setUploadSummary(response.data.summary);
            setFailureFileUrl(response.data.failureFileUrl);
            console.log(response.data);
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(`Upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setUploading(false);
            setSelectedFile(null);
        }
    };

    const handleDownloadSample = () => {
        const backendUrl = import.meta.env.VITE_ADMIN_BACKEND_URL || 'http://localhost:3001';
        window.open(`${backendUrl}/download-sample-csv`, '_blank');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Admin Student Data Uploader</h1>
            </header>
            <main>
                <div className="upload-section">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <button onClick={handleUpload} disabled={!selectedFile || uploading}>
                        {uploading ? 'Processing...' : 'Upload CSV'}
                    </button>
                </div>
                {message && <p className="message">{message}</p>}
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
                        <a href={failureFileUrl} download>Download Failed Cases CSV</a>
                    </div>
                )}
                <div className="sample-download">
                    <button onClick={handleDownloadSample}>Download Sample CSV</button>
                </div>
                <p className="note">
                    Upload a CSV file to create or update student records.
                    <br/>
                    Expected columns: "studentId" (must be 6 digits), "Student Name", "Contact", "Grade", "Parent Name".
                </p>
            </main>
        </div>
    );
}

export default App;