const { uploadToDrive } = require('../excel/googleDrive.js');
const fs = require('fs');

async function main() {
    const filePath = process.argv[2];
    const fileName = process.argv[3];

    if (!filePath || !fileName) {
        console.error("Usage: node upload_wrapper.js <filePath> <fileName>");
        process.exit(1);
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const publicUrl = await uploadToDrive(fileBuffer, fileName);
        console.log(publicUrl);
    } catch (error) {
        console.error("Upload failed:", error);
        process.exit(1);
    }
}

main();
