import pandas as pd
import requests
import json
import os
import numpy as np # Added import
import datetime # Added import
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:4000")
PUPPETEER_BASE_URL = os.getenv("PUPPETEER_BASE_URL", "http://localhost:5200")

STUDENT_DETAILS_PATH = "studentDetails.csv"
VIBEMATCH_ANSWERS_PATH = "vibematch.csv"
EDUSTAT_ANSWERS_PATH = "edustat.csv"
OUTPUT_REPORT_PATH = "career_reports_summary.csv"

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
        
        # Add Authorization header if token is available
        if self.token and "Authorization" not in headers:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            response = requests.request(method, url, json=json, headers=headers)
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response body: {e.response.text}")
            return None

    def register_user(self, user_data):
        url = f"{self.backend_url}/api/auth/upsert-register"
        response = self._make_request("POST", url, json=user_data)
        if response and response.get("token"):
            self.token = response["token"]
            self.user_id = response["user"]["id"]
            print(f"User {user_data.get('email', user_data.get('studentID'))} registered/updated. User ID: {self.user_id}")
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
    # Remove any non-digit characters and try to convert to int
    cleaned_grade = ''.join(filter(str.isdigit, str(grade_str)))
    return int(cleaned_grade) if cleaned_grade else None

def read_student_details(path):
    df = pd.read_csv(path)
    # Standardize column names
    df = df.rename(columns={
        'studentID': 'studentID',
        'Student Name': 'fullName',
        'School Name': 'schoolName',
        'Grade': 'grade',
        'City': 'city',
        'Contact': 'mobileNo'
    })
    # Fill missing values with None or appropriate defaults
    df = df.where(pd.notna(df), None)
    # Clean grade column
    df['grade'] = df['grade'].apply(clean_grade)
    return df

def read_test_answers(path, test_name):
    df = pd.read_csv(path)
    df = df.rename(columns={'Unique Code': 'studentID'})
    df = df.where(pd.notna(df), None)
    
    # Extract Q1-Q15 (or Q1-Q14 for vibematch) as answers for the specific test
    answers = {}
    for col in df.columns:
        if col.startswith('Q'):
            question_id = f"{test_name}_{col.lower()}" # e.g., vibematch_q1
            answers[question_id] = df[col] # This needs to be handled row-wise

    return df # Return full dataframe to process row by row

# --- Main Logic ---
def main():
    api_client = APIClient(BACKEND_BASE_URL, PUPPETEER_BASE_URL)

    student_details_df = read_student_details(STUDENT_DETAILS_PATH) # Moved this line here
    vibematch_df = read_test_answers(VIBEMATCH_ANSWERS_PATH, "vibematch")
    edustat_df = read_test_answers(EDUSTAT_ANSWERS_PATH, "edustat")

    results = []
    output_df = pd.DataFrame(columns=[
        "Test Date", "City", "Student Name", "Class", "School Name", 
        "Parent Name", "Parent WhatsApp Number", "Career Report Link",
        "Career Domain 1", "Career Domain 2", "Career Domain 3", "Student ID"
    ])

    # Try to load existing summary data, if any
    if os.path.exists(OUTPUT_REPORT_PATH):
        try:
            output_df = pd.read_csv(OUTPUT_REPORT_PATH)
            # Ensure 'Student ID' column is of appropriate type for merging
            output_df['Student ID'] = output_df['Student ID'].astype(str)
        except pd.errors.EmptyDataError:
            print(f"Warning: {OUTPUT_REPORT_PATH} is empty. Starting with a new summary.")
        except Exception as e:
            print(f"Error loading existing summary CSV: {e}. Starting with a new summary.")
            output_df = pd.DataFrame(columns=[
                "Test Date", "City", "Student Name", "Class", "School Name", 
                "Parent Name", "Parent WhatsApp Number", "Career Report Link",
                "Career Domain 1", "Career Domain 2", "Career Domain 3", "Student ID"
            ])

    for index, student in student_details_df.iterrows():
        student_id = str(student['studentID']) # Ensure student_id is string for consistent merging
        print(f"Processing student: {student['fullName']} (ID: {student_id})")

        # 1. Register User
        # Using mobileNo as a fallback for email if not present, and studentID for username
        email = f"{student_id}@example.com" # Default email
        if student['mobileNo'] and str(student['mobileNo']) != "(Not filled)":
            email = f"{student['mobileNo']}@example.com" # Use mobile no for unique email

        register_data = {
            "email": email,
            "password": "password123",  # Using a default password
            "name": student['fullName'],
            "fullName": student['fullName'],
            "schoolName": student['schoolName'],
            "grade": student['grade'],
            "board": "CBSE", # Assuming CBSE as a default board, need to confirm from edustat or studentDetails if available
            "mobileNo": str(student_id) if student['mobileNo'] is None or str(student['mobileNo']) == "(Not filled)" else student['mobileNo'],
            "studentID": str(student_id)
        }
        
        # Make sure grade is an integer if not None
        if register_data['grade'] is not None:
            try:
                register_data['grade'] = int(register_data['grade'])
            except ValueError:
                register_data['grade'] = None # Set to None if conversion fails

        registered_user_response = api_client.register_user(register_data)
        if not registered_user_response or not api_client.token:
            print(f"Failed to register user {student_id}. Skipping.")
            # If registration fails, we still want to record other info if possible or skip this student entirely
            # For now, let's skip to avoid incomplete data in the summary
            continue

        # 2. Prepare Test Answers (always attempt, even if some answers are missing)
        student_vibematch_data = vibematch_df[vibematch_df['studentID'].astype(str) == student_id].head(1)
        student_edustat_data = edustat_df[edustat_df['studentID'].astype(str) == student_id].head(1)
        print(f"check data {edustat_df} and {student_edustat_data}")

        combined_answers = {}

        # Process vibematch answers
        if not student_vibematch_data.empty:
            for col in student_vibematch_data.columns:
                if col.startswith('Q') and col[1:].isdigit() and pd.notna(student_vibematch_data.iloc[0][col]):
                    q_num = col[1:] # Extract number part (e.g., "1" from "Q1")
                    formatted_q_num = f"{int(q_num):02d}" # Pad with zero if single digit
                    combined_answers[f"v_{formatted_q_num}"] = student_vibematch_data.iloc[0][col]
        
        # Process edustat answers
        if not student_edustat_data.empty:
            for col in student_edustat_data.columns:
                if col.startswith('Q') and col[1:].isdigit() and pd.notna(student_edustat_data.iloc[0][col]):
                    q_num = col[1:] # Extract number part (e.g., "1" from "Q1")
                    formatted_q_num = f"{int(q_num):02d}" # Pad with zero if single digit
                    
                    # Special handling for Q3 and Q4 in edustat which contain comma-separated values
                    if col == 'Q3' or col == 'Q4':
                        val = student_edustat_data.iloc[0][col]
                        if isinstance(val, str):
                            combined_answers[f"e_{formatted_q_num}"] = [item.strip() for item in val.split(',')]
                        else:
                            combined_answers[f"e_{formatted_q_num}"] = val
                    else:
                        combined_answers[f"e_{formatted_q_num}"] = student_edustat_data.iloc[0][col]

        # Extract other details for submission from edustat_df (always initialize as empty lists/dicts if not found)
        extracurriculars = []
        parent_careers = []
        study_abroad_preference = None
        work_style_preference = None
        
        if not student_edustat_data.empty:
            # Q7: "Sports, Music, Dance, Theatre, Debate, Robotics" -> extracurriculars
            q7_val = student_edustat_data.iloc[0].get('Q7')
            if isinstance(q7_val, str) and q7_val:
                extracurriculars = [item.strip() for item in q7_val.split(',')]
            
            # Q8: "IT/Software, Finance, Medicine, Business" -> parent_careers
            q8_val = student_edustat_data.iloc[0].get('Q8')
            if isinstance(q8_val, str) and q8_val:
                parent_careers = [item.strip() for item in q8_val.split(',')]

            # Q12: study_abroad_preference (Yes/No/Maybe)
            q12_val = student_edustat_data.iloc[0].get('Q12')
            if q12_val == 'Yes definitely' or q12_val == 'Yes':
                study_abroad_preference = True
            elif q12_val == 'No':
                study_abroad_preference = False
            
            # Q11: workStylePreference (Office/Field/Remote/Hybrid/Depends)
            work_style_preference = student_edustat_data.iloc[0].get('Q11')
            if work_style_preference == 'Skipped':
                work_style_preference = None

        submission_data = {
            "userName": student['fullName'],
            "schoolName": student['schoolName'],
            "grade": student['grade'],
            "board": "CBSE", # Placeholder, ideally derived from edustat if available
            "answers": combined_answers,
            "subjectScores": {}, # Initialized as an empty dictionary
            "extracurriculars": extracurriculars,
            "parentCareers": parent_careers,
            "studyAbroadPreference": study_abroad_preference,
            "workStylePreference": work_style_preference
        }

        
        # Helper function to convert numpy types to native Python types
        def convert_numpy_types(obj):
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(elem) for elem in obj]
            elif isinstance(obj, (pd.Timestamp, datetime.datetime, datetime.date)): # Handle datetime objects
                return obj.isoformat()
            elif isinstance(obj, (np.integer, np.floating)):
                return obj.item()
            elif pd.isna(obj): # Convert pandas NaNs to None
                return None
            return obj

       # Ensure grade is an integer; default to 8 if missing or invalid
        if submission_data['grade'] is None or submission_data['grade'] == "" or str(submission_data['grade']).lower() == "nan":
            submission_data['grade'] = 8
        else:
            try:
                submission_data['grade'] = int(submission_data['grade'])
            except (ValueError, TypeError):
                submission_data['grade'] = 8  # Default fallback
        
        # Convert all numpy types in submission_data to native Python types
        submission_data = convert_numpy_types(submission_data)

        print(f"submit api payload : {submission_data}")

        # 3. Submit Combined Test
        submission_response = api_client.submit_test("combined", submission_data)
        if not submission_response or not submission_response.get("report"):
            print(f"Failed to submit test for student {student_id}. Skipping PDF generation.")
            # Record basic student info even if report generation fails
            current_student_summary = {
                "Test Date": student.get('Date'),
                "City": student.get('city'),
                "Student Name": student.get('fullName'),
                "Class": student.get('grade'),
                "School Name": student.get('schoolName'),
                "Parent Name": student.get('Parent Name'),
                "Parent WhatsApp Number": student.get('mobileNo'),
                "Career Report Link": "N/A - Report Generation Failed",
                "Career Domain 1": None,
                "Career Domain 2": None,
                "Career Domain 3": None,
                "Student ID": student_id
            }
            # Update or add to output_df
            current_student_summary_df = pd.DataFrame([current_student_summary])
            output_df = pd.concat([output_df[output_df['Student ID'] != student_id], current_student_summary_df], ignore_index=True)
            output_df.to_csv(OUTPUT_REPORT_PATH, index=False)
            print(f"Updated summary for {student['fullName']}. Report Generation Failed.")
            continue

        report_data = submission_response["report"]

        # 4. Generate PDF Report
        pdf_payload = {
            "reportData": report_data,
            "mobileNo": student['mobileNo'] if str(student['mobileNo']) != "(Not filled)" else None,
            "studentID": str(student_id),
            "studentName": student['fullName']
        }
        pdf_response = api_client.generate_pdf_report(pdf_payload)
        report_link = pdf_response.get("reportLink") if pdf_response else "N/A"
        if report_link == "N/A":
            print(f"Failed to generate PDF report for student {student_id}.")
            # Even if PDF generation fails, record the available info
            career_domains = report_data.get("top5Buckets", [])
            career_domain_1 = career_domains[0].get("bucketName") if len(career_domains) > 0 else None
            career_domain_2 = career_domains[1].get("bucketName") if len(career_domains) > 1 else None
            career_domain_3 = career_domains[2].get("bucketName") if len(career_domains) > 2 else None

            current_student_summary = {
                "Test Date": student.get('Date'),
                "City": student.get('city'),
                "Student Name": student.get('fullName'),
                "Class": student.get('grade'),
                "School Name": student.get('schoolName'),
                "Parent Name": student.get('Parent Name'),
                "Parent WhatsApp Number": student.get('mobileNo'),
                "Career Report Link": "N/A - PDF Generation Failed",
                "Career Domain 1": career_domain_1,
                "Career Domain 2": career_domain_2,
                "Career Domain 3": career_domain_3,
                "Student ID": student_id
            }
            # Update or add to output_df
            current_student_summary_df = pd.DataFrame([current_student_summary])
            output_df = pd.concat([output_df[output_df['Student ID'] != student_id], current_student_summary_df], ignore_index=True)
            output_df.to_csv(OUTPUT_REPORT_PATH, index=False)
            print(f"Updated summary for {student['fullName']}. PDF Generation Failed.")
            continue

        # 5. Collect Output Data for successful report generation
        career_domains = report_data.get("top5Buckets", [])
        career_domain_1 = career_domains[0].get("bucketName") if len(career_domains) > 0 else None
        career_domain_2 = career_domains[1].get("bucketName") if len(career_domains) > 1 else None
        career_domain_3 = career_domains[2].get("bucketName") if len(career_domains) > 2 else None

        current_student_summary = {
            "Test Date": student.get('Date'),
            "City": student.get('city'),
            "Student Name": student.get('fullName'),
            "Class": student.get('grade'),
            "School Name": student.get('schoolName'),
            "Parent Name": student.get('Parent Name'),
            "Parent WhatsApp Number": student.get('mobileNo'),
            "Career Report Link": report_link,
            "Career Domain 1": career_domain_1,
            "Career Domain 2": career_domain_2,
            "Career Domain 3": career_domain_3,
            "Student ID": student_id
        }
        
        # Update or add to output_df
        current_student_summary_df = pd.DataFrame([current_student_summary])
        output_df = pd.concat([output_df[output_df['Student ID'] != student_id], current_student_summary_df], ignore_index=True)
        
        output_df.to_csv(OUTPUT_REPORT_PATH, index=False) # Write after each student
        print(f"Completed processing for {student['fullName']}. Report Link: {report_link}")  

if __name__ == "__main__":
    main()
