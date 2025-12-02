# PDF Service - HTML-PDF Implementation

## Overview
This PDF service generates career report PDFs using **html-pdf** library, which renders HTML templates directly to PDF without requiring a full browser.

**Key Benefits:**
- ⚡ **Fast** - Generates PDFs in 1-3 seconds (vs 10+ seconds with Puppeteer)
- 🎨 **Exact Design Match** - Uses the exact HTML templates from puppeteer-ms
- 📦 **Lightweight** - No browser overhead
- 🔧 **Easy to Modify** - Update designs by editing HTML templates

## Architecture

```
Backend/AI Report Service → PDF Service (html-pdf) → HTML Templates → PDF
```

## Setup

### 1. Install Dependencies
```bash
cd pdf-service
npm install
# or
bun install
```

### 2. Run the Service
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Service will run on `http://localhost:5100`

## API Endpoints

### Generate PDF
**POST** `/generate-pdf`

Request body:
```json
{
  "studentId": "564890",
  "studentName": "Vikrant Rao",
  "schoolName": "St. Joseph English School",
  "grade": "10",
  "board": "CBSE",
  "examLocation": "In school premises",
  "riasecScores": {
    "R": 72,
    "I": 56,
    "A": 91,
    "S": 76,
    "E": 62,
    "C": 48
  }
}
```

Response: PDF binary (application/pdf)

### Health Check
**GET** `/health`

Response:
```json
{
  "status": "ok",
  "service": "pdf-service",
  "engine": "html-pdf",
  "templates": "puppeteer-ms designs"
}
```

## File Structure

```
pdf-service/
├── server-htmlpdf.js      # Main service file
├── package.json           # Dependencies
├── templates/             # HTML templates (copied from puppeteer-ms)
│   ├── page1.html        # Cover/Student Card
│   ├── page2.html        # RIASEC Profile
│   ├── page3.html        # Career Recommendations (Part 1)
│   ├── page4.html        # Career Recommendations (Part 2)
│   ├── page5.html        # Career Recommendations (Part 3)
│   ├── page6.html        # Thank You Page
│   └── assets/           # Images and resources
└── server.js             # Legacy jsPDF version (kept for reference)
```

## How It Works

1. **Load Template**: Reads HTML file from `templates/` folder
2. **Inject Data**: Replaces variables in HTML with report data
3. **Render PDF**: html-pdf library converts HTML → PDF
4. **Return**: Sends PDF to client

## Template Modification

To customize the PDF design:
1. Edit the relevant HTML file in `templates/` folder
2. Keep asset paths relative (`./assets/image.png`)
3. Service automatically picks up changes on restart

## Performance

| Task | Time |
|------|------|
| Generate Single Page | 1-2s |
| Generate 6 Pages | 6-12s |
| Asset Loading | Included |

**Note**: First request may take slightly longer as html-pdf initializes.

## Environment Variables

```bash
PORT=5100  # Default port (can be overridden)
```

## Troubleshooting

### Templates Not Found
- Ensure `templates/` folder exists with all HTML files
- Check file paths in error messages

### Assets Not Rendering
- Verify asset files are in `templates/assets/`
- Check asset paths use relative URLs: `./assets/image.png`

### PDF Generation Slow
- First request initializes html-pdf (~3s)
- Subsequent requests are faster
- Monitor console output for timing

## Integration with Backend

Update your backend to call this service:

```javascript
// Backend code example
const pdfResponse = await fetch('http://localhost:5100/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportData)
});

const pdf = await pdfResponse.arrayBuffer();
```

## Migration from Puppeteer-MS

Old flow:
```
Backend → Puppeteer-MS (Google Drive integration) → Browser rendering
```

New flow:
```
Backend → PDF-Service (html-pdf) → Template rendering
```

Benefits:
- Faster generation
- No Google Drive dependency  
- Easier to customize
- Uses same design templates

## Future Enhancements

- [ ] Multi-page PDF merging (pdf-merge library)
- [ ] Dynamic career card generation
- [ ] Skill recommendation insertion
- [ ] Custom watermarks
- [ ] PDF encryption
- [ ] Batch processing

## License

Part of AcadSpace Pathfinder project
