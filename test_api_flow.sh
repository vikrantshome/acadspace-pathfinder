#!/bin/bash
# Automated test flow for AcadSpace Pathfinder backend
# 1. Register, 2. Login, 3. Submit test, 4. Get report


API_URL="http://localhost:4000/api"
TIMESTAMP=$(date +%s)
EMAIL="testuser_${TIMESTAMP}@example.com"
PASSWORD="test123"
NAME="Test User"
MOBILE_NO="9876543${TIMESTAMP: -3}"

# Check for jq
if ! command -v jq &> /dev/null; then
  echo "[ERROR] jq is required but not installed. Please install jq (brew install jq) and rerun the script."
  exit 1
fi


# 1. Register and extract token
REG_PAYLOAD=$(cat <<EOF
{
  "email": "$EMAIL",
  "password": "$PASSWORD",
  "name": "$NAME",
  "mobileNo": "$MOBILE_NO"
}
EOF
)

REG_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REG_PAYLOAD")
echo "[REGISTER] Response: $REG_RESPONSE"

# Extract token from registration response
TOKEN=$(echo "$REG_RESPONSE" | jq -r '.token')
echo "[REGISTER] Token: $TOKEN"

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "Registration failed or token not received. Exiting."
  exit 1
fi


# 2. Submit both test answers at once (combined)
COMBINED_PAYLOAD=$(cat <<EOF
{
  "userName": "$NAME",
  "grade": 11,
  "board": "CBSE",
  "answers": {
    "v_01": 3, "v_02": 3, "v_03": 3, "v_04": 3, "v_05": 3, "v_06": 3, "v_07": 3, "v_08": 3, "v_09": 3, "v_10": 3, "v_11": 3, "v_12": 3, "v_13": 3, "v_14": 3, "v_15": "I enjoyed robotics club.",
    "e_01": "11", "e_02": "CBSE", "e_03": ["Mathematics", "Physics"], "e_04": {"Mathematics": 90, "Physics": 85}, "e_05": "Top 5", "e_06": ["Robotics / Coding"], "e_07": ["IT / Software"], "e_08": "No taboos", "e_09": "Yes, definitely", "e_10": "Yes", "e_11": "Remote / Flexible", "e_12": "I love math.", "e_13": "None", "e_14": "Yes", "e_15": "Engineering"
  },
  "subjectScores": {"Mathematics": 90, "Physics": 85},
  "extracurriculars": ["Robotics / Coding"],
  "parentCareers": ["IT / Software"],
  "studyAbroadPreference": true,
  "workStylePreference": "Remote / Flexible"
}
EOF
)

curl -s -X POST "$API_URL/tests/combined/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMBINED_PAYLOAD" > response.json

echo "[COMBINED SUBMIT] Response:"
cat response.json
echo "" # Newline

# Extract Report ID
REPORT_ID=$(grep -o '"reportId":"[^"]*"' response.json | cut -d'"' -f4)

if [ -z "$REPORT_ID" ]; then
  echo "[COMBINED SUBMIT] Test submission failed. Exiting."
  exit 1
fi

echo "[COMBINED SUBMIT] Report ID: $REPORT_ID"


# 3. Get report
REPORT_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/reports/$REPORT_ID")
echo "[REPORT] Report retrieved successfully"

# 4. Download PDF from PDF service using actual report data
echo "[PDF SERVICE] Downloading PDF..."
PDF_PAYLOAD=$(cat <<EOF
$REPORT_RESPONSE
EOF
)

curl -s -X POST http://localhost:5100/generate-pdf \
  -H "Content-Type: application/json" \
  -d "$PDF_PAYLOAD" \
  --output "Career_Report_${EMAIL%.com}.pdf" 2>/dev/null

if [ -f "Career_Report_${EMAIL%.com}.pdf" ] && [ -s "Career_Report_${EMAIL%.com}.pdf" ]; then
  FILE_SIZE=$(ls -lh "Career_Report_${EMAIL%.com}.pdf" | awk '{print $5}')
  echo "[PDF SERVICE] ✓ PDF successfully generated: Career_Report_${EMAIL%.com}.pdf (Size: $FILE_SIZE)"
else
  echo "[PDF SERVICE] ✗ Error: PDF generation failed. Check if pdf-service is running on port 5100."
fi
