// Backend API Integration
// This file provides all API functions to interact with the Spring Boot backend

import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL; // e.g., http://localhost:8080/api
// Admin base URL is without the /api suffix. API_CONFIG.BASE_URL is usually {host}/api. 
// We want just {host}/admin.
const ADMIN_BASE_URL = API_BASE_URL.replace(/\/api$/, '') + '/api/admin'; 
const API_HEALTH_CHECK_URL = API_CONFIG.HEALTH_CHECK_URL;

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  // Profile fields
  fullName?: string;
  parentName?: string,
  schoolName?: string;
  grade?: number;
  board?: string;
  mobileNo?: string;
  studentID?: string;
  city?: string;
  state?: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
  profiles?: User[];
}

interface TestSubmission {
  userName: string;
  schoolName?: string;
  grade: number;
  board: string;
  answers: Record<string, any>;
  subjectScores?: Record<string, number>;
  extracurriculars?: string[];
  parentCareers?: string[];
  studyAbroadPreference?: boolean;
  workStylePreference?: string;
}

/** Fallback school list used when /api/schools is unavailable (e.g. 401 during signup) */
const FALLBACK_SCHOOLS: string[] = [
  "Airson English School", "Angel Public School", "BASANT VALLY PUBLIC SCHOOL",
  "Beena English Medium School", "Blooming buds zion academy", "Bodhi Taru International School",
  "Bright Scholar Senior Secondary School", "Chanda Public School", "Daffodils foundation for learning",
  "Delhi English Academy", "Devin Academy For Learning", "Dnyan Sagar English Medium School",
  "Dr. Shivajirao S. Jondhle International School", "Endeavour's international School",
  "Fortune High School", "GCC International School", "Greenwood High School", "GRENO PUBLIC SCHOOL",
  "Gupta PU College", "Harsha International public school", "Indian Public School",
  "Jnanasagara International Public School", "Kalka Public School",
  "Lilavati Lalji Dayal High School", "Lilavati Lalji Dayal High School and College Of Commerce",
  "Maria Niketan Insitution", "Maria Niketan School of institutions", "MORNING STAR PUBLIC SCHOOL",
  "Mount Carmel Public School", "Muni International School", "Mysore West Lions Sevaniketan",
  "Pict Model School", "Piet Sanskriti Senior Secondary School", "PNC Cognitio School",
  "Police Modern School", "Priyadarshini High School", "Radcliff School",
  "Raman Munjal Vidya Mandir", "Reena Mehta Junior College of Arts, Science & Commerce",
  "ROYAL ACADEMY PUBLIC SCHOOL", "Rustomjee International School", "Sahaj International School",
  "St. Mary's English Public School", "Saraswati vidya mandir", "Seshadripuram High School",
  "Seventh Day Adventist Senior Secondary School", "Shivaji Shikshan Sanstha",
  "SRSD Sr.Sec School Delhi", "St Alousious School", "St Annes PU College", "St Antony's School",
  "St. MEERA'S Public School", "St. Ramanand English Medium High School",
  "ST. ROCK'S GIRLS HIGH SCHOOL", "St.Antony's School khora GZB", "Suncity School",
  "Vedas International School", "Vidya School", "VIDYA SPOORTHI SCHOOL",
  "Vidyadeep Vidyalaya", "Vishwa Bharti Public", "Wisdom Era English Medium School",
  "Wisdom Wings School",
];

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Non-2xx → build useful error message
    if (!response.ok) {
      const raw = await response.text().catch(() => null);
      let msg = `HTTP ${response.status}`;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          msg = parsed?.message || parsed?.error || raw;
        } catch {
          msg = raw;
        }
      }
      throw new Error(msg);
    }

    // 204 No Content → return null as T
    if (response.status === 204) {
      return null as T;
    }

    // If body is empty or not JSON, handle gracefully
    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text().catch(() => '');
    if (!raw) {
      // empty body but OK status
      return null as T;
    }

    if (!contentType.includes('application/json')) {
      // return raw text if you ever need it; otherwise null
      return raw as unknown as T;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Body said JSON but was empty/invalid
      return null as T;
    }
  }


  // Authentication
  async register(
    email: string, 
    password: string, 
    name: string, 
    fullName?: string,
    parentName?: string,
    schoolName?: string, 
    grade?: number, 
    board?: string,
    mobileNo?: string,
    city?: string, // Added city
    state?: string // Added state
  ): Promise<AuthResponse> {
    localStorage.removeItem('login_source'); // Clear previous login source
    const response = await fetch(`${API_BASE_URL}/auth/upsert-register`, { // Changed endpoint
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        fullName,
        parentName,
        schoolName,
        grade,
        board,
        mobileNo,
        city, // Included city
        state // Included state
      }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    // Check if data is null or missing token
    if (!data) {
      throw new Error('Invalid response from server. Please check your backend URL configuration.');
    }

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    } else {
      throw new Error('Registration failed: No token received from server');
    }

    return data;
  }

  async login(username: string, password: string, storeToken = true): Promise<AuthResponse> {
    localStorage.removeItem('login_source'); // Clear previous login source
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    if (!data) {
      throw new Error('Invalid response from server. Please check your backend URL configuration.');
    }

    if (data.token) {
      if (storeToken) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
    } else {
      throw new Error('Login failed: No token received from server');
    }

    return data;
  }

  async lookup(studentID: string, mobileNo: string): Promise<AuthResponse> {
    localStorage.removeItem('login_source'); // Clear previous login source
    const response = await fetch(`${API_BASE_URL}/auth/lookup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ studentID, mobileNo }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    if (!data) {
      throw new Error('Invalid response from server. Please check your backend URL configuration.');
    }

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    } else if (data.profiles && data.profiles.length > 0) {
      // Multiple profiles found, return data without token
      return data;
    }

    return data;
  }

  async nlpLogin(nlpSsoToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/nlp-login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nlpSsoToken }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    if (!data) {
      throw new Error('Invalid response from server. Please check your backend URL configuration.');
    }

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('login_source', 'nlp'); // Set NLP login source
    }

    return data;
  }

  /**
   * Persist token and user data after out-of-band verification (eg. OTP)
   */
  setAuth(token: string, user: User) {
    localStorage.removeItem('login_source'); // Assuming standard flow unless specified
    this.token = token;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    return data.user;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('login_source');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
  
  isNlpLogin(): boolean {
    return localStorage.getItem('login_source') === 'nlp';
  }

  getCurrentUserFromStorage(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Tests
  async getTests(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/tests`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any[]>(response);
  }

  async getTest(testId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async submitTest(testId: string, submission: TestSubmission): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });

    return this.handleResponse<any>(response);
  }

  // Progress
  async saveProgress(testId: string, progress: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/progress/save`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        testId,
        ...progress,
      }),
    });

    return this.handleResponse<any>(response);
  }

  async getProgress(userId: string, testId?: string): Promise<any> {
    const url = testId
      ? `${API_BASE_URL}/progress/${userId}?testId=${testId}`
      : `${API_BASE_URL}/progress/${userId}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async resetProgress(testId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/progress/reset?testId=${testId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  // Reports
  async getReport(reportId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getReportLink(reportId: string, partner?: string): Promise<{ reportLink: string }> {
    const url = partner 
      ? `${API_BASE_URL}/reports/${reportId}/report-link?partner=${partner}`
      : `${API_BASE_URL}/reports/${reportId}/report-link`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ reportLink: string }>(response);
  }

  async getDemoReport(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/demo/aisha`);
    return this.handleResponse<any>(response);
  }

  async getUserReports(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/user/${userId}`, {
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return []; // No reports found
      }

      return this.handleResponse<any[]>(response);
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return [];
      }
    return this.handleResponse<any[]>(response);
    }
  }

  async generateReportLink(userId: string): Promise<{ reportLink: string }> {
    const response = await fetch(`${API_BASE_URL}/reports/generate/${userId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ reportLink: string }>(response);
  }

  // Admin Endpoints
  async getAdminStats(): Promise<any> {
    const response = await fetch(`${ADMIN_BASE_URL}/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getAdminCareers(): Promise<any[]> {
    const response = await fetch(`${ADMIN_BASE_URL}/careers`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }

  async createCareer(careerData: any): Promise<any> {
    const response = await fetch(`${ADMIN_BASE_URL}/careers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(careerData),
    });
    return this.handleResponse<any>(response);
  }

  async updateCareer(careerId: string, careerData: any): Promise<any> {
    const response = await fetch(`${ADMIN_BASE_URL}/careers/${careerId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(careerData),
    });
    return this.handleResponse<any>(response);
  }

  async deleteCareer(careerId: string): Promise<any> {
    const response = await fetch(`${ADMIN_BASE_URL}/careers/${careerId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getAdminAuditLogs(page: number = 0, size: number = 50): Promise<any[]> {
    const response = await fetch(`${ADMIN_BASE_URL}/audit?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }

  async getAllReportsForAnalytics(page: number = 0, size: number = 50): Promise<any> {
    const response = await fetch(`${ADMIN_BASE_URL}/analytics/reports-summary?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  // Profile management
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    return data.user;
  }

  // Schools — public endpoint (no auth required during signup)
  async getSchools(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/schools`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        return this.handleResponse<string[]>(response);
      }
      // Non-OK (401, 404, etc.) → fall through to fallback
    } catch {
      // Network error → fall through to fallback
    }
    console.warn('Schools API not available, using fallback list');
    return FALLBACK_SCHOOLS;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_HEALTH_CHECK_URL}`);
    return this.handleResponse<any>(response);
  }

  // OTP helpers
  // sendOtp accepts either `{ email?: string, phone?: string }` for flexibility
  async sendOtp(payload: { email?: string; phone?: string }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/otp/send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // verifyOtp accepts `{ email?: string, phone?: string, otp: string }`
  async verifyOtp(payload: { email?: string; phone?: string; otp: string }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // AI Service health check - through Java backend
  async aiServiceHealthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai-service/health`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();
export type { User, AuthResponse, TestSubmission };