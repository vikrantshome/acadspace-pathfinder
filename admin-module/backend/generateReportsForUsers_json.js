const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { format, writeToPath } = require("@fast-csv/format");
const { log } = require("console");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") }); // Load main .env

const NAVIKSHA_BACKEND_URL =
  process.env.NAVIKSHA_BACKEND_URL || "http://localhost:4000";
const LOGS_DIR = path.join(__dirname, "logs");
const API_ERRORS_LOG_FILE = path.join(LOGS_DIR, "api_report_gen_errors.log");

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Enhanced logging function for API errors during report generation
const logApiError = (errorContext) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp: timestamp,
    ...errorContext,
  };
  const logMessage = `${JSON.stringify(logEntry)}
`;

  fs.appendFile(API_ERRORS_LOG_FILE, logMessage, (err) => {
    if (err) {
      console.error("Failed to write to API error log file:", err);
    }
  });
};

async function generateUserReportSummary(jsonInputFilePath, csvOutputFilePath) {
  let usersData = [];
  try {
    const rawData = fs.readFileSync(jsonInputFilePath, "utf-8");
    usersData = JSON.parse(rawData);
  } catch (error) {
    console.error(
      `Error reading or parsing JSON input file (${jsonInputFilePath}):`,
      error.message
    );
    return;
  }

  const outputRows = [];
  const headers = [
    "Student Code",
    "Date",
    "City",
    "School Name",
    "Student Name",
    "Email",
    "Contact",
    "Grade",
    "Report Link",
    "Career 1",
    "Career 2",
    "Career 3",
  ];
  outputRows.push(headers); // Add headers to the output

  const TEST_ID_VIBEMATCH = "vibematch";
  const TEST_ID_EDUSTATS = "edustats";

  for (const user of usersData) {
    const studentId = user.studentID;
    const userId = user._id.$oid;
    const email = user.email;
    const password = user.password || "123456"; // Assuming a default password if not available for upsert
    const name = user.name;
    const mobileNo = user.mobileNo;
    const grade = user.grade;
    const schoolName = user.schoolName;
    const city = user.city;
    // const parentName = user.fullName || user.name ; // Using fullName or name for Parent Name if available

    let createdAtDate = "N/A";
    if (user.createdAt && user.createdAt.$date) {
      try {
        const dt_object = new Date(user.createdAt.$date);
        createdAtDate = dt_object.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
      } catch (e) {
        console.warn(
          `Could not parse createdAt date for studentID ${studentId}: ${e.message}`
        );
      }
    }

    let reportLink = "N/A";
    let career1 = "N/A";
    let career2 = "N/A";
    let career3 = "N/A";

    let authToken = null;
    try {
      // Step 1: Upsert/Login user to get a token
      console.log(`Processing student ${studentId}: Upserting to get token...`);
      const upsertResponse = await axios.post(
        `${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`,
        {
          name: name,
          email: email,
          password: password,
          mobileNo: mobileNo,
          studentID: studentId,
          grade: grade,
          // parentName: parentName,
          fullName: user.fullName,
          schoolName: schoolName,
          board: user.board,
          city: city,
        }
      );
      authToken = upsertResponse.data.token;
      console.log(`Successfully obtained token for ${studentId}.`);
    } catch (error) {
      console.error(
        `Error upserting/logging in ${studentId}: ${error.message}`
      );
      logApiError({
        studentId,
        endpoint: `${NAVIKSHA_BACKEND_URL}/api/auth/upsert-register`,
        message: `Failed to upsert/login student: ${error.message}`,
        requestConfig: error.config,
        responseData: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      outputRows.push([
        studentId,
        createdAtDate,
        city,
        schoolName,
        name,
        parentName,
        mobileNo,
        grade,
        "N/A",
        "N/A",
        "N/A",
        "N/A", // All report-related fields as N/A
      ]);
      continue; // Skip to next student
    }

    try {
      // Step 2: Try to fetch existing reports
      console.log(
        `Fetching reports for student ${studentId} (userId: ${userId})...`
      );
      const reportsResponse = await axios.get(
        `${NAVIKSHA_BACKEND_URL}/api/reports/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const reports = reportsResponse.data;
      reports[0].studentID = studentId;

      const report = reports[0].reportData;
      console.log("check vibe score : ", JSON.stringify(report.vibeScores));

      const submitResponse = await axios.post(
        `http://localhost:5200/generate-pdf`,
        {
          ...reports[0],
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      reportLink = submitResponse.data.reportLink;
      //         }
      if (report && report.top5Buckets && report.top5Buckets.length > 0) {
        career1 = report.top5Buckets[0].bucketName;
        career2 = report.top5Buckets[1]?.bucketName;
        career3 = report.top5Buckets[2]?.bucketName;
      }
      console.log(
        `Successfully generated new report for ${studentId}. Link: ${reportLink}`
      );
      //     } else {
      //         console.log(`No test progress or answers found for ${studentId} for vibematch or edustats. Cannot generate report.`);
      //     }
      // }
    } catch (error) {
      console.error(
        `Error processing reports for ${studentId}: ${error.message}`
      );
      logApiError({
        studentId,
        endpoint: error.config?.url, // Log the specific failing endpoint
        message: `Failed to fetch/generate reports: ${error.message}`,
        requestConfig: error.config,
        responseData: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        tokenAttempted: authToken,
      });
    }

    outputRows.push([
      studentId,
      createdAtDate,
      city,
      schoolName,
      name,
      email,
      mobileNo,
      grade,
      reportLink,
      career1,
      career2,
      career3,
    ]);
  }

  // DEBUG: Save outputRows as JSON for inspection
  const debugJsonFilePath = csvOutputFilePath.replace(".csv", "_DEBUG.json");
  try {
    fs.writeFileSync(
      debugJsonFilePath,
      JSON.stringify(outputRows, null, 2),
      "utf-8"
    );
    console.log(`DEBUG: outputRows saved as JSON at ${debugJsonFilePath}`);
  } catch (jsonErr) {
    console.error("DEBUG: Error writing debug JSON file:", jsonErr);
  }

  // Write to CSV
  try {
    await writeToPath(csvOutputFilePath, outputRows, { headers: false });
    console.log(`CSV summary successfully generated at ${csvOutputFilePath}`);
  } catch (err) {
    console.error("Error writing CSV file:", err);
    throw err; // Re-throw to propagate the error
  }
}

if (require.main === module) {
  const jsonInputFilePath = path.join(
    __dirname,
    "../../naviksha.users_3rd_dec.json"
  );
  const csvOutputFilePath = path.join(
    __dirname,
    "reports",
    `user_report_summary_${new Date().toISOString().slice(0, 10)}.csv`
  );

  generateUserReportSummary(jsonInputFilePath, csvOutputFilePath).catch(
    (err) => {
      console.error(
        "An unhandled error occurred during script execution:",
        err
      );
    }
  );
}
