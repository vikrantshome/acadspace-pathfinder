const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

const CREDENTIALS_PATH = path.join(__dirname, '../client_secret_4133800428-9nlcg87uct83fkpctgk5m8p4ut2h55v2.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');
const FOLDER_NAME = 'careerReports';

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

module.exports = { uploadToDrive };
