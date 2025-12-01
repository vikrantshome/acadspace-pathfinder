const fs = require('fs');
const path = require('path');

const careersFilePath = path.join(__dirname, 'naviksha.careers.json');

try {
    const careersData = JSON.parse(fs.readFileSync(careersFilePath, 'utf8'));

    const uniqueBuckets = new Set();
    careersData.forEach(career => {
        if (career.bucket) {
            uniqueBuckets.add(career.bucket);
        }
    });

    console.log('Unique Bucket Values:');
    Array.from(uniqueBuckets).sort().forEach(bucket => {
        console.log(`- ${bucket}`);
    });

} catch (error) {
    console.error('Error reading or parsing careers data:', error);
}
