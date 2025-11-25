# PDF Report Redesign Plan

This document outlines the plan to redesign the PDF career report to match the new "CAREER COMPASS" design.

## 1. Executive Summary

The goal is to replace the current, programmatically-drawn PDF with a new, professionally designed version. The new design is significantly more complex, involving sophisticated layouts, branding, and graphical assets.

The current implementation uses the `jsPDF` library to manually draw every line and text element. This is unmaintainable for the new design.

**Recommendation:** We will switch the technology in the `pdf-service` from `jsPDF` to **Puppeteer**. Puppeteer is a headless browser library that allows us to build the report using standard **HTML and CSS** and then convert it to a high-fidelity PDF. This approach is more modern, maintainable, and suitable for complex visual layouts.

## 2. Implementation Steps

### Step 2.1: Setup and Preparation

1.  **Add Puppeteer Dependency:** The `puppeteer` library will be added to the `pdf-service/package.json` file.
2.  **Install Dependencies:** Run `npm install` within the `pdf-service` directory to install Puppeteer.
3.  **Backup Current Logic:** The existing `pdf-service/server.js` will be copied to `pdf-service/server-old-design.js` to serve as a backup.
4.  **Asset Directory:** A new directory, `pdf-service/assets`, will be created to store image assets required for the new design.

### Step 2.2: Asset Collection (User Input Required)

The following graphical assets are required from the Figma design. They should be provided in a web-compatible format (e.g., PNG or SVG).

*   `CAREER_COMPASS_logo.png`
*   `ALLEN_ONLINE_logo.png`
*   `cover_page_ribbon.svg` (The blue ribbon/arrow graphic)
*   `expert_discussion_icon.png` (The icon for the "Connect with an expert" section)

These assets will be converted to Base64 strings and embedded directly into the HTML to create a self-contained document.

### Step 2.3: HTML Template Development

A new function, `generateReportHTML(reportData)`, will be created in `pdf-service/server.js`. This function will be responsible for generating a single HTML string that represents the entire report.

*   **Structure:** The function will take the `reportData` JSON object and build the HTML structure for each section: Cover Page, Profile Summary, Personality Overview, Career Recommendations, etc.
*   **Styling:** A `<style>` block will be included in the HTML head. This block will contain all the CSS necessary to style the report, including:
    *   **Fonts:** Import and use the fonts specified in the Figma design (e.g., from Google Fonts).
    *   **Colors:** Implement the new blue-centric color palette.
    *   **Layout:** Use modern CSS like Flexbox and Grid to create the complex card layouts, columns, and alignments.
*   **Data Binding:** The `reportData` will be dynamically inserted into the HTML template.

### Step 2.4: PDF Generation with Puppeteer

The main `/generate-pdf` endpoint in `pdf-service/server.js` will be completely rewritten. The new workflow will be:

1.  Receive the `reportData` from the POST request.
2.  Call `generateReportHTML(reportData)` to get the complete HTML of the report.
3.  Launch a headless Puppeteer browser instance.
4.  Create a new page and set its content to the generated HTML.
5.  Use `page.pdf()` to generate a PDF buffer from the rendered page. Key options will include `{ format: 'A4', printBackground: true }` to ensure all styles and colors are preserved.
6.  Close the browser instance to free up resources.
7.  Send the generated PDF buffer back to the client in the HTTP response.

### Step 2.5: Frontend Integration

The ability to generate the PDF directly in the browser will be removed, as Puppeteer is a backend-only technology.

1.  **Modify API Call:** The "Download PDF" button in the React application will be modified. Instead of using the local `pdf-generator.ts`, it will make an API call to the backend endpoint that triggers the `pdf-service`.
2.  **Handle File Download:** The frontend will receive the PDF file in the API response and trigger a browser download for the user.
3.  **Deprecate Old Code:** The `src/lib/pdf-generator.ts` file will no longer be needed and can be deleted to avoid confusion and code duplication.

### Step 2.6: Cleanup

Once the new implementation is verified, the old `jsPDF`-based code and its dependencies will be removed from `pdf-service/server.js` to keep the codebase clean.
