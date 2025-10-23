#!/usr/bin/env python3
import requests
import json
import sys

BASE_URL = "http://localhost:4000"

def get_token():
    """Get JWT token for API access"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "test@example.com",
        "password": "test123"
    })
    return response.json().get("token")

def regenerate_report():
    """Regenerate report with test data"""
    token = get_token()
    if not token:
        print("❌ Failed to get token")
        return
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    test_data = {
        "userName": "Test User",
        "grade": 11,
        "board": "CBSE",
        "answers": {
            "v_01": 5, "v_02": 3, "v_03": 5, "v_04": 2, "v_05": 3, "v_06": 2,
            "v_07": 4, "v_08": 5, "v_09": 5, "v_10": 3, "v_11": 4, "v_12": 2,
            "v_13": 3, "v_14": 5, "v_15": "I love solving complex problems and building software applications."
        },
        "subjectScores": {
            "Mathematics": 90, "Physics": 85, "Chemistry": 80, 
            "Computer Science": 95, "English": 75, "History": 70
        },
        "extracurriculars": ["Coding Club", "Science Fair", "Math Olympiad", "Robotics"],
        "parentCareers": ["Software Engineer", "Data Scientist"],
        "studyAbroadPreference": True,
        "workStylePreference": "Office / Lab work"
    }
    
    response = requests.post(f"{BASE_URL}/api/tests/combined/submit", headers=headers, json=test_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Report generated: {data['reportId']}")
        print(f"📊 AI Enhanced: {data['report']['aiEnhanced']}")
        print(f"🎯 Top Career: {data['report']['top5Buckets'][0]['topCareers'][0]['careerName']}")
        print(f"📈 Match Score: {data['report']['top5Buckets'][0]['topCareers'][0]['matchScore']}%")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    regenerate_report()
