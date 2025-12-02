import pandas as pd
import requests
import json
import os
import numpy as np
import datetime
import subprocess
import glob
import time

# --- Configuration ---
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:4000")
PDF_SERVICE_URL = os.getenv("PDF_SERVICE_URL", "http://localhost:5100")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUTS_DIR = os.path.join(BASE_DIR, "../inputs")
OUTPUT_DIR = os.path.join(BASE_DIR, "../excel")

STUDENT_DETAILS_DIR = os.path.join(INPUTS_DIR, "studentDetails")
VIBEMATCH_ANSWERS_PATH = os.path.join(INPUTS_DIR, "vibematch_part_1_2.csv")
EDUSTAT_ANSWERS_PATH = os.path.join(INPUTS_DIR, "edustat_part_1_2.csv")
OUTPUT_REPORT_PATH = os.path.join(OUTPUT_DIR, "career_reports_summary_generated.csv")
UPLOAD_WRAPPER_PATH = os.path.join(BASE_DIR, "upload_wrapper.js")

# --- API Client ---
class APIClient:
    def __init__(self, backend_url, pdf_service_url):
        self.backend_url = backend_url
        self.pdf_service_url = pdf_service_url
        self.token = None
        self.user_id = None

    def _make_request(self, method, url, json=None, headers=None, stream=False):
        if headers is None:
            headers = {}
        
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            response = requests.request(method, url, json=json, headers=headers, stream=stream)
            # response.raise_for_status() # Let the caller handle status to see error body
            return response
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return None

    def register_user(self, user_data):
        # Matches test_api_flow.sh: POST /api/auth/register
        url = f"{self.backend_url}/api/auth/register"
        response = self._make_request("POST", url, json=user_data)
        
        if response and response.status_code in [200, 201]:
            data = response.json()
            if data.get("token"):
                self.token = data["token"]
                if "user" in data:
                    self.user_id = data["user"].get("id")
                print(f"User {user_data.get('email')} registered. Token received.")
                return data
        
        if response:
            print(f"Registration failed: {response.status_code} - {response.text}")
        return None

    def submit_test(self, test_id, submission_data):
        url = f"{self.backend_url}/api/tests/{test_id}/submit"
        response = self._make_request("POST", url, json=submission_data)
        if response and response.status_code in [200, 201]:
            return response.json()
        if response:
            print(f"Submission failed: {response.status_code} - {response.text}")
        return None
    
    def get_report(self, report_id):
        url = f"{self.backend_url}/api/reports/{report_id}"
        response = self._make_request("GET", url)
        if response and response.status_code == 200:
            return response.json()
        if response:
             print(f"Get Report failed: {response.status_code} - {response.text}")
        return None

    def download_pdf(self, pdf_payload, output_path):
        url = f"{self.pdf_service_url}/generate-pdf"
        response = self._make_request("POST", url, json=pdf_payload, stream=True)
        if response and response.status_code == 200:
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        if response:
             print(f"PDF Download failed: {response.status_code} - {response.text}")
        return False

# --- CSV Processing ---
def clean_grade(grade_str):
    if pd.isna(grade_str):
        return None
    cleaned_grade = ''.join(filter(str.isdigit, str(grade_str)))
    return int(cleaned_grade) if cleaned_grade else None

def read_student_details(directory):
    all_files = glob.glob(os.path.join(directory, "*.csv"))
    df_list = []
    for filename in all_files:
        df = pd.read_csv(filename)
        df_list.append(df)
    
    if not df_list:
        return pd.DataFrame()
        
    df = pd.concat(df_list, ignore_index=True)
    
    # Standardize column names
    df = df.rename(columns={
        'studentID': 'studentID',
        'Name': 'fullName',
        'School Name': 'schoolName',
        'Grade': 'grade',
        'City': 'city',
        'Contact': 'mobileNo',
        'Parent Name': 'parentName',
        'Date': 'date'
    })
    
    df = df.where(pd.notna(df), None)
    df['grade'] = df['grade'].apply(clean_grade)
    return df

def read_test_answers(path, test_name):
    df = pd.read_csv(path)
    df = df.rename(columns={'Unique Code': 'studentID'})
    df = df.where(pd.notna(df), None)
    return df

def upload_to_drive(file_path, file_name):
    try:
        result = subprocess.run(
            ["node", UPLOAD_WRAPPER_PATH, file_path, file_name],
            capture_output=True,
            text=True,
            check=True
        )
        output_lines = result.stdout.strip().split('\n')
        for line in reversed(output_lines):
            if "drive.google.com" in line:
                if "Upload complete:" in line:
                    return line.split("Upload complete:")[1].strip()
                return line.strip()
        
        last_line = output_lines[-1].strip()
        if last_line.startswith("http"):
            return last_line
            
        print(f"Could not find URL in output: {result.stdout}")
        return None
    except subprocess.CalledProcessError as e:
        print(f"Upload failed: {e.stderr}")
        return None

# --- Main Logic ---
def main():
    api_client = APIClient(BACKEND_BASE_URL, PDF_SERVICE_URL)

    print("Reading student details...")
    student_details_df = read_student_details(STUDENT_DETAILS_DIR)
    print(f"Found {len(student_details_df)} students.")
    
    print("Reading test answers...")
    vibematch_df = read_test_answers(VIBEMATCH_ANSWERS_PATH, "vibematch")
    edustat_df = read_test_answers(EDUSTAT_ANSWERS_PATH, "edustat")

    output_df = pd.DataFrame(columns=[
        "Test Date", "City", "Student Name", "Class", "School Name", 
        "Parent Name", "Parent WhatsApp Number", "Career Report Link",
        "Career Domain 1", "Career Domain 2", "Career Domain 3", "Student ID"
    ])

    if os.path.exists(OUTPUT_REPORT_PATH):
        try:
            output_df = pd.read_csv(OUTPUT_REPORT_PATH)
            output_df['Student ID'] = output_df['Student ID'].astype(str)
        except:
            pass

    count = 0
    LIMIT = 1 # Limit to 1 for testing

    for index, student in student_details_df.iterrows():
        if count >= LIMIT:
            print(f"Reached limit of {LIMIT} students. Stopping.")
            break

        student_id = str(student['studentID'])
        print(f"\nProcessing student: {student['fullName']} (ID: {student_id})")

        # 1. Register User
        email = f"{student_id}@example.com"
        if student['mobileNo'] and str(student['mobileNo']) != "(Not filled)" and str(student['mobileNo']) != "None":
            clean_mobile = ''.join(filter(str.isdigit, str(student['mobileNo'])))
            if clean_mobile:
                email = f"{clean_mobile}@example.com"
        
        register_data = {
            "email": email,
            "password": "password123",
            "name": student['fullName'],
            "mobileNo": str(student['mobileNo']) if student['mobileNo'] else str(student_id)
        }
        
        registered_user_data = api_client.register_user(register_data)
        if not registered_user_data or not api_client.token:
            print(f"Failed to register user {student_id}. Skipping.")
            continue

        # 2. Prepare Test Answers
        student_vibematch_data = vibematch_df[vibematch_df['studentID'].astype(str) == student_id].head(1)
        student_edustat_data = edustat_df[edustat_df['studentID'].astype(str) == student_id].head(1)

        combined_answers = {}

        # Vibematch
        if not student_vibematch_data.empty:
            for col in student_vibematch_data.columns:
                if col.startswith('Q') and pd.notna(student_vibematch_data.iloc[0][col]):
                    q_part = col[1:]
                    if q_part.isdigit():
                        formatted_q_num = f"{int(q_part):02d}"
                        combined_answers[f"v_{formatted_q_num}"] = student_vibematch_data.iloc[0][col]

        # Edustat
        extracurriculars = []
        parent_careers = []
        study_abroad_preference = None
        work_style_preference = None
        
        if not student_edustat_data.empty:
            for col in student_edustat_data.columns:
                if col.startswith('Q') and pd.notna(student_edustat_data.iloc[0][col]):
                    q_part = col[1:]
                    if q_part.isdigit():
                        formatted_q_num = f"{int(q_part):02d}"
                        val = student_edustat_data.iloc[0][col]
                        
                        if col == 'Q3' or col == 'Q4':
                            if isinstance(val, str):
                                combined_answers[f"e_{formatted_q_num}"] = [item.strip() for item in val.split(',')]
                            else:
                                combined_answers[f"e_{formatted_q_num}"] = val
                        else:
                            combined_answers[f"e_{formatted_q_num}"] = val
            
            q7_val = student_edustat_data.iloc[0].get('Q7')
            if isinstance(q7_val, str) and q7_val:
                extracurriculars = [item.strip() for item in q7_val.split(',')]
            
            q8_val = student_edustat_data.iloc[0].get('Q8')
            if isinstance(q8_val, str) and q8_val:
                parent_careers = [item.strip() for item in q8_val.split(',')]

            q12_val = student_edustat_data.iloc[0].get('Q12')
            if q12_val in ['Yes definitely', 'Yes']:
                study_abroad_preference = True
            elif q12_val == 'No':
                study_abroad_preference = False
            
            work_style_preference = student_edustat_data.iloc[0].get('Q11')
            if work_style_preference == 'Skipped':
                work_style_preference = None

        grade_val = student['grade']
        if grade_val is not None:
            try:
                grade_val = int(grade_val)
            except ValueError:
                grade_val = 10 

        submission_data = {
            "userName": student['fullName'],
            "grade": grade_val if grade_val else 10, 
            "board": "CBSE",
            "answers": combined_answers,
            "subjectScores": {}, 
            "extracurriculars": extracurriculars,
            "parentCareers": parent_careers,
            "studyAbroadPreference": study_abroad_preference,
            "workStylePreference": work_style_preference
        }

        def convert_numpy_types(obj):
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(elem) for elem in obj]
            elif isinstance(obj, (np.integer, np.floating)):
                return obj.item()
            elif pd.isna(obj):
                return None
            return obj

        submission_data = convert_numpy_types(submission_data)

        # 3. Submit Combined Test
        submission_response = api_client.submit_test("combined", submission_data)
        if not submission_response or not submission_response.get("reportId"):
            print(f"Failed to submit test for student {student_id}.")
            continue
        
        report_id = submission_response["reportId"]
        print(f"Report ID: {report_id}")

        # 4. Get Report Data
        report_data = api_client.get_report(report_id)
        if not report_data:
            print(f"Failed to get report data for {report_id}")
            continue

        # 5. Generate and Download PDF
        pdf_filename = f"Career_Report_{student_id}.pdf"
        pdf_path = os.path.join(BASE_DIR, pdf_filename)
        
        print("Downloading PDF...")
        if api_client.download_pdf(report_data, pdf_path):
            print(f"PDF downloaded to {pdf_path}")
            
            # 6. Upload to Drive
            print("Uploading to Drive...")
            drive_link = upload_to_drive(pdf_path, pdf_filename)
            
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            
            if drive_link:
                print(f"Uploaded: {drive_link}")
            else:
                drive_link = "Upload Failed"
        else:
            print("PDF generation failed")
            drive_link = "PDF Generation Failed"

        # 7. Record Result
        career_domains = report_data.get("top5Buckets", [])
        career_domain_1 = career_domains[0].get("bucketName") if len(career_domains) > 0 else None
        career_domain_2 = career_domains[1].get("bucketName") if len(career_domains) > 1 else None
        career_domain_3 = career_domains[2].get("bucketName") if len(career_domains) > 2 else None

        current_student_summary = {
            "Test Date": student.get('date'),
            "City": student.get('city'),
            "Student Name": student.get('fullName'),
            "Class": student.get('grade'),
            "School Name": student.get('schoolName'),
            "Parent Name": student.get('parentName'),
            "Parent WhatsApp Number": student.get('mobileNo'),
            "Career Report Link": drive_link,
            "Career Domain 1": career_domain_1,
            "Career Domain 2": career_domain_2,
            "Career Domain 3": career_domain_3,
            "Student ID": student_id
        }
        
        current_student_summary_df = pd.DataFrame([current_student_summary])
        output_df = pd.concat([output_df[output_df['Student ID'] != student_id], current_student_summary_df], ignore_index=True)
        output_df.to_csv(OUTPUT_REPORT_PATH, index=False)
        
        count += 1

if __name__ == "__main__":
    main()
