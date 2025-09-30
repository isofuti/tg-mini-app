import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(initData: string) {
    const { data } = await this.client.post('/auth/telegram', { initData });
    return data;
  }

  async verifyToken() {
    const { data } = await this.client.get('/auth/verify');
    return data;
  }

  // User
  async getUser() {
    const { data } = await this.client.get('/users/me');
    return data;
  }

  async updateUser(userData: { firstName?: string; lastName?: string; email?: string }) {
    const { data } = await this.client.patch('/users/me', userData);
    return data;
  }

  // Catalog
  async getCatalog() {
    const { data } = await this.client.get('/catalog');
    return data;
  }

  async getCourseType(courseType: string) {
    const { data } = await this.client.get(`/catalog/${courseType}`);
    return data;
  }

  // Courses
  async getCourses() {
    const { data } = await this.client.get('/courses');
    return data;
  }

  async getCourse(id: string) {
    const { data } = await this.client.get(`/courses/${id}`);
    return data;
  }

  async createCourse(courseData: {
    courseType: string;
    surveyResponses: Array<{ question: string; answer: string }>;
  }) {
    const { data } = await this.client.post('/courses', courseData);
    return data;
  }

  // Lessons
  async getLesson(id: string) {
    const { data } = await this.client.get(`/lessons/${id}`);
    return data;
  }

  async completeLesson(id: string) {
    const { data } = await this.client.post(`/lessons/${id}/complete`);
    return data;
  }

  // Points
  async getPointsBalance() {
    const { data } = await this.client.get('/points/balance');
    return data;
  }

  async getPointsHistory() {
    const { data } = await this.client.get('/points/history');
    return data;
  }
}

export const api = new ApiClient();
