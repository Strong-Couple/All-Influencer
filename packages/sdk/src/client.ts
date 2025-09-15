import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, User, PaginatedResponse, Pagination } from '@all-influencer/types';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || 'http://localhost:3001/api/v1',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 [${config.method?.toUpperCase()}] ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        console.log(`✅ [${response.status}] ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API 에러:`, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // 사용자 관련 API
  async getUsers(params?: Pagination): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params,
    });
    return response.data.data!;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('/users', userData);
    return response.data.data!;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.client.patch<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data!;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // 헬퍼 메서드
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Raw 요청 메서드
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }
}

// 기본 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 안전 훅 스타일 함수들
export const usersApi = {
  getAll: (params?: Pagination) => apiClient.getUsers(params),
  getById: (id: string) => apiClient.getUser(id),
  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => apiClient.createUser(data),
  update: (id: string, data: Partial<User>) => apiClient.updateUser(id, data),
  delete: (id: string) => apiClient.deleteUser(id),
};

