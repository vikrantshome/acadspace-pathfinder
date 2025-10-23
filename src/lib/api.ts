// Backend API Integration
// This file provides all API functions to interact with the Spring Boot backend

import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_HEALTH_CHECK_URL = API_CONFIG.HEALTH_CHECK_URL;

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  // Profile fields
  fullName?: string;
  schoolName?: string;
  grade?: number;
  board?: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

interface TestSubmission {
  userName: string;
  grade: number;
  board: string;
  answers: Record<string, any>;
  subjectScores?: Record<string, number>;
  extracurriculars?: string[];
  parentCareers?: string[];
  studyAbroadPreference?: boolean;
  workStylePreference?: string;
}

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
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<AuthResponse>(response);

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    return data;
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
  }

  isAuthenticated(): boolean {
    return !!this.token;
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
      throw error;
    }
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

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_HEALTH_CHECK_URL}`);
    return this.handleResponse<any>(response);
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