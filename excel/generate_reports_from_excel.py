import pandas as pd
import requests
import json
import os
import numpy as np
import datetime
import logging
from dotenv import load_dotenv

load_dotenv()

# --- Logger Setup ---
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)
timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
log_file_path = os.path.join(LOG_DIR, f"api_requests_{timestamp}.log")
error_log_file_path = os.path.join(LOG_DIR, f"api_errors_{timestamp}.log")

# Create a logger
logger = logging.getLogger()
logger.setLevel(logging.INFO) # Set overall logging level to INFO

# Formatter
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# File handler for all logs (INFO and above)
file_handler = logging.FileHandler(log_file_path)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# File handler for errors only
error_file_handler = logging.FileHandler(error_log_file_path)
error_file_handler.setLevel(logging.ERROR) # Only log ERROR messages
error_file_handler.setFormatter(formatter)
logger.addHandler(error_file_handler)

# Stream handler for console output
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.INFO) # Console shows INFO and above
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

# --- Configuration ---
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:4000")
PUPPETEER_BASE_URL = os.getenv("PUPPETEER_BASE_URL", "http://localhost:5200")

STUDENT_DETAILS_PATH = os.path.join("input", "Page_1_(Info)_export (2).csv")
VIBEMATCH_ANSWERS_PATH = os.path.join("input", "Page_2_(VibeMatch)_export (1).csv")
EDUSTAT_ANSWERS_PATH = os.path.join("input", "Page_3_(EduStats)_export.csv")
OUTPUT_DIR = "output"


# --- API Client ---
class APIClient:
    def __init__(self, backend_url, puppeteer_url):
        self.backend_url = backend_url
        self.puppeteer_url = puppeteer_url
        self.token = None
        self.user_id = None

    def _make_request(self, method, url, json=None, headers=None):
        if headers is None:
            headers = {}

        if self.token and "Authorization" not in headers:
            headers["Authorization"] = f"Bearer {self.token}"

        log_data = json.copy() if json else {}
        if 'password' in log_data:
            log_data['password'] = '***REDACTED***'
        
        logging.info(f"Request: {method} {url}")
        if log_data:
            logging.info(f"Request Body: {log_data}")

        try:
            response = requests.request(method, url, json=json, headers=headers)
            response.raise_for_status()
            response_json = response.json()
            logging.info(f"Response Status: {response.status_code}")
            logging.info(f"Response Body: {response_json}")
            return response_json
        except requests.exceptions.RequestException as e:
            logging.error(f"API request failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logging.error(f"Response status: {e.response.status_code}")
                try:
                    # Try to log JSON response if it exists
                    logging.error(f"Response body: {e.response.json()}")
                except requests.exceptions.JSONDecodeError:
                    # Fallback to logging raw text if response is not JSON
                    logging.error(f"Response body (not json): {e.response.text}")
            return None

    def register_user(self, user_data):
        url = f"{self.backend_url}/api/auth/upsert-register"
        response = self._make_request("POST", url, json=user_data)
        if response and response.get("token"):
            self.token = response["token"]
            self.user_id = response["user"]["id"]
            print(
                f"User {user_data.get('email', user_data.get('studentID'))} registered/updated. User ID: {self.user_id}")
        return response

    def submit_test(self, test_id, submission_data):
        url = f"{self.backend_url}/api/tests/{test_id}/submit"
        return self._make_request("POST", url, json=submission_data)

    def generate_pdf_report(self, report_data_payload):
        url = f"{self.puppeteer_url}/generate-pdf"
        return self._make_request("POST", url, json=report_data_payload)


# --- CSV Processing ---
def clean_grade(grade_str):
    if pd.isna(grade_str):
        return None
    cleaned_grade_str = ''.join(filter(str.isdigit, str(grade_str)))
    
    if not cleaned_grade_str:
        return None
        
    try:
        grade_int = int(cleaned_grade_str)
        # Apply cleanup rule: if grade is > 12 and it's a multi-digit number, take the first digit.
        # This handles cases like '62' -> 6, '15' -> 1, but leaves '10', '11', '12' as they are.
        if grade_int > 12 and len(cleaned_grade_str) > 1:
            grade_int = int(cleaned_grade_str[0])
        return grade_int
    except ValueError:
        # If conversion fails after filtering digits (e.g., empty string after filter), return None
        return None


def read_student_details(path):
    df = pd.read_csv(path, dtype={'Student ID': str})
    df = df.rename(columns={
        'Student ID': 'studentID',
        'School': 'schoolName',
        'Grade': 'grade',
        'City': 'city',
        'Mobile No': 'mobileNo',
        'Parent Name': 'parentName',
        'Email': 'email'
    })

    if 'studentID' in df.columns:
        df['studentID'] = df['studentID'].str.split('.').str[0]
        df.dropna(subset=['studentID'], inplace=True)
        df = df[df['studentID'].str.strip() != '']
        
    df['fullName'] = df['First Name'].fillna('') + ' ' + df['Last Name'].fillna('')
    df['fullName'] = df['fullName'].str.strip()
    df = df.where(pd.notna(df), None)
    df['grade'] = df['grade'].apply(clean_grade)
    return df


def read_test_answers(path, test_name):
    df = pd.read_csv(path, dtype={'Student ID': str})
    df = df.rename(columns={'Student ID': 'studentID'})
    if 'studentID' in df.columns:
        df['studentID'] = df['studentID'].str.split('.').str[0]
        df.dropna(subset=['studentID'], inplace=True)
        df = df[df['studentID'].str.strip() != '']
    df = df.where(pd.notna(df), None)
    return df


# --- Main Logic ---
def main():
    api_client = APIClient(BACKEND_BASE_URL, PUPPETEER_BASE_URL)

    student_details_df = read_student_details(STUDENT_DETAILS_PATH)
    vibematch_df = read_test_answers(VIBEMATCH_ANSWERS_PATH, "vibematch")
    edustat_df = read_test_answers(EDUSTAT_ANSWERS_PATH, "edustat")

    output_rows_headers = [
        "Test Date", "City", "First Name", "Last Name", "Class", "School Name",
        "Parent Name", "Parent WhatsApp Number", "Career Report Link",
        "Career Domain 1", "Career Domain 2", "Career Domain 3", "Student ID", "Status"
    ]

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_report_path = os.path.join(OUTPUT_DIR, f"career_reports_summary_{timestamp}.csv")
    
    pd.DataFrame(columns=output_rows_headers).to_csv(output_report_path, index=False, mode='w')
    logging.info(f"Initialized summary report at {output_report_path}")

    for index, student in student_details_df.iterrows():
        student_id = str(student['studentID'])
        logging.info(f"Processing student: {student['fullName']} (ID: {student_id})")

        # --- Format data for output ---
        fullName = student.get('fullName', '')
        name_parts = str(fullName).split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        grade = student.get('grade')
        class_str = f"Class {int(grade)}" if pd.notna(grade) else None

        date_of_event = student.get('Date')
        formatted_date = None
        if pd.notna(date_of_event):
            try:
                formatted_date = pd.to_datetime(date_of_event).strftime('%Y-%m-%d')
            except Exception as e:
                logging.warning(f"Could not format date for student {student_id}. Using original value. Error: {e}")
                formatted_date = date_of_event

        # --- Register User ---
        email = student.get('email')
        if not email or str(email).lower() in ['nan', 'undefined', '']:
            if student['mobileNo'] and str(student['mobileNo']) not in ["(Not filled)", "nan"]:
                email = f"{student['mobileNo']}@example.com"
            else:
                email = f"{student_id}@example.com"

        register_data = {
            "email": email, "password": "password123", "name": student['fullName'], "fullName": student['fullName'],
            "schoolName": student['schoolName'], "grade": student['grade'], "board": "CBSE",
            "mobileNo": str(student_id) if student['mobileNo'] is None or str(student['mobileNo']) == "(Not filled)" else student['mobileNo'],
            "studentID": str(student_id)
        }

        if register_data['grade'] is not None:
            try:
                register_data['grade'] = int(register_data['grade'])
            except (ValueError, TypeError):
                register_data['grade'] = None

        registered_user_response = api_client.register_user(register_data)
        if not registered_user_response or not api_client.token:
            logging.error(f"Failed to register user {student_id}. Skipping.")
            continue

        # --- Prepare and Submit Test Answers ---
        student_vibematch_data = vibematch_df[vibematch_df['studentID'] == student_id].head(1)
        student_edustat_data = edustat_df[edustat_df['studentID'] == student_id].head(1)

        logging.info(f"Looking for student ID: {student_id} in VibeMatch and EduStats files.")
        if student_vibematch_data.empty:
            logging.warning("No VibeMatch data found for this student.")
        else:
            logging.info(f"Found VibeMatch data: \n{student_vibematch_data.to_string()}")
        
        if student_edustat_data.empty:
            logging.warning("No EduStats data found for this student.")
        else:
            logging.info(f"Found EduStats data: \n{student_edustat_data.to_string()}")

        combined_answers = {}
        if not student_vibematch_data.empty:
            for col in student_vibematch_data.columns:
                if col.startswith('Q') and col[1:].isdigit() and pd.notna(student_vibematch_data.iloc[0][col]):
                    q_num = int(col[1:])
                    # v_15 is a string answer, others are numeric
                    if q_num == 15:
                        combined_answers[f"v_{q_num:02d}"] = student_vibematch_data.iloc[0][col]
                    else:
                        combined_answers[f"v_{q_num:02d}"] = int(student_vibematch_data.iloc[0][col])

        if not student_edustat_data.empty:
            for col in student_edustat_data.columns:
                if col.startswith('Q') and col[1:].isdigit() and pd.notna(student_edustat_data.iloc[0][col]):
                    q_num = int(col[1:])
                    val = student_edustat_data.iloc[0][col]
                    if col in ['Q3', 'Q4'] and isinstance(val, str):
                        combined_answers[f"e_{q_num:02d}"] = [item.strip() for item in val.split(',')]
                    else:
                        combined_answers[f"e_{q_num:02d}"] = val

        extracurriculars = []
        parent_careers = []
        study_abroad_preference = None
        work_style_preference = None
        if not student_edustat_data.empty:
            q7_val = student_edustat_data.iloc[0].get('Q7')
            if isinstance(q7_val, str): extracurriculars = [item.strip() for item in q7_val.split(',')]
            q8_val = student_edustat_data.iloc[0].get('Q8')
            if isinstance(q8_val, str): parent_careers = [item.strip() for item in q8_val.split(',')]
            q12_val = student_edustat_data.iloc[0].get('Q12')
            if q12_val in ['Yes definitely', 'Yes']: study_abroad_preference = True
            elif q12_val == 'No': study_abroad_preference = False
            work_style_preference = student_edustat_data.iloc[0].get('Q11')
            if work_style_preference == 'Skipped': work_style_preference = None

        submission_data = {
            "userName": student['fullName'], "schoolName": student['schoolName'], "grade": student['grade'],
            "board": "CBSE", "answers": combined_answers, "subjectScores": {}, "extracurriculars": extracurriculars,
            "parentCareers": parent_careers, "studyAbroadPreference": study_abroad_preference,
            "workStylePreference": work_style_preference
        }

        def convert_numpy_types(obj):
            if isinstance(obj, dict): return {k: convert_numpy_types(v) for k, v in obj.items()}
            if isinstance(obj, list): return [convert_numpy_types(elem) for elem in obj]
            if isinstance(obj, (pd.Timestamp, datetime.datetime, datetime.date)): return obj.isoformat()
            if isinstance(obj, np.floating): return float(obj)
            if isinstance(obj, np.integer): return int(obj)
            if pd.isna(obj): return None
            return obj

        submission_data = convert_numpy_types(submission_data)
        if submission_data.get('grade') is None: submission_data['grade'] = 8

        submission_response = api_client.submit_test("combined", submission_data)

        report_link, career_domain_1, career_domain_2, career_domain_3 = "N/A", None, None, None
        status_message = "OK"

        if not submission_response or not submission_response.get("report"):
            status_message = "Report Generation Failed: No report data in submission response."
            logging.error(f"Failed to submit test for student {student_id}. No report data received.")
        else:
            report_data = submission_response["report"]
            # Extract reportLink directly from the submission_response
            report_link = submission_response.get("reportLink")
            
            if not report_link:
                status_message = "Report Link Not Found in Submission Response"
                logging.error(f"Report link not found for {student['fullName']} in submission response.")
            else:
                logging.info(f"Report link for {student['fullName']}: {report_link}")

            career_domains = report_data.get("top5Buckets", [])
            career_domain_1 = career_domains[0].get("bucketName") if len(career_domains) > 0 else None
            career_domain_2 = career_domains[1].get("bucketName") if len(career_domains) > 1 else None
            career_domain_3 = career_domains[2].get("bucketName") if len(career_domains) > 2 else None

        student_summary_dict = {
            "Test Date": formatted_date, "City": student.get('city'), "First Name": first_name,
            "Last Name": last_name, "Class": class_str, "School Name": student.get('schoolName'),
            "Parent Name": student.get('parentName'), "Parent WhatsApp Number": student.get('mobileNo'),
            "Career Report Link": report_link, "Career Domain 1": career_domain_1,
            "Career Domain 2": career_domain_2, "Career Domain 3": career_domain_3,
            "Student ID": student_id, "Status": status_message
        }
        pd.DataFrame([student_summary_dict]).to_csv(output_report_path, index=False, mode='a', header=False)
        logging.info(f"Appended summary for student {student_id} to {output_report_path}")

    logging.info(f"\nAll students processed. Final report available at {output_report_path}")


if __name__ == "__main__":
    main()
