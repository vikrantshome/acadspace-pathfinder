const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;
const { Readable } = require('stream'); // Move import to top level

const CREDENTIALS_PATH = path.join(__dirname, '../client_secret_4133800428-9nlcg87uct83fkpctgk5m8p4ut2h55v2.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');
const FOLDER_NAME = 'careerReports';

// --- GLOBAL CACHE ---
let driveClient = null;
let cachedFolderId = null;

/**
 * Singleton to initialize Google Drive Client only once.
 */
async function getDriveClient() {
    if (driveClient) return driveClient;

    try {
        // Parallel read is faster
        const [credsData, tokenData] = await Promise.all([
            fs.readFile(CREDENTIALS_PATH),
            fs.readFile(TOKEN_PATH)
        ]);

        const credentials = JSON.parse(credsData);
        const token = JSON.parse(tokenData);
        const { client_secret, client_id } = credentials.web;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost");
        oAuth2Client.setCredentials(token);

        driveClient = google.drive({ version: "v3", auth: oAuth2Client });
        return driveClient;
    } catch (error) {
        console.error("Failed to initialize Drive client:", error);
        throw error;
    }
}

/**
 * Caches the Folder ID so we don't search for it on every upload.
 */
async function getTargetFolderId(drive) {
    if (cachedFolderId) return cachedFolderId;

    // Check if folder exists
    const folderSearch = await drive.files.list({
        q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id)", // We only need the ID
    });

    if (folderSearch.data.files.length > 0) {
        cachedFolderId = folderSearch.data.files[0].id;
        console.log("📁 (Cached) Existing folder found:", cachedFolderId);
    } else {
        const folderMetadata = {
            name: FOLDER_NAME,
            mimeType: "application/vnd.google-apps.folder",
        };
        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: "id",
        });
        cachedFolderId = folder.data.id;
        console.log("📁 (Cached) Folder created:", cachedFolderId);
    }

    return cachedFolderId;
}

async function uploadToDrive(pdfBuffer, filename) {
    try {
        const drive = await getDriveClient();
        const folderId = await getTargetFolderId(drive);

        console.log(`⬆ Uploading PDF: ${filename}...`);

        const fileMetadata = {
            name: filename,
            parents: [folderId],
        };

        const media = {
            mimeType: "application/pdf",
            body: Readable.from(pdfBuffer),
        };

        // Create file and permissions in parallel if possible?
        // No, we need fileId first. But we can optimize the fields requested.
        const response = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: "id", // We don't need webViewLink here yet
        });

        const fileId = response.data.id;

        // Make public
        await drive.permissions.create({
            fileId,
            requestBody: { role: "reader", type: "anyone" },
        });

        // Construct URL manually to avoid an extra API "get" call
        // Using 'export=download' forces a download, 'view' allows previewing
        const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
        
        console.log("✔ Upload complete:", publicUrl);
        return publicUrl;

    } catch (err) {
        console.error("❌ Drive Upload Error:", err);
        // Reset cache on error (e.g., if token expired or folder was deleted manually)
        driveClient = null; 
        cachedFolderId = null; 
        throw new Error('Failed to upload PDF to Google Drive');
    }
}

module.exports = { uploadToDrive };