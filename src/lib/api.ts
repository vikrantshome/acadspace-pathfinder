// Backend API Integration
// This file provides all API functions to interact with the Spring Boot backend

import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
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

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch('http://localhost:4000/health');
    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();
export type { User, AuthResponse, TestSubmission };