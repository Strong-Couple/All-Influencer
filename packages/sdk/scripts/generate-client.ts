#!/usr/bin/env ts-node

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const execAsync = promisify(exec);

interface GenerateOptions {
  apiUrl?: string;
  outputDir?: string;
  verbose?: boolean;
}

class SDKGenerator {
  private readonly API_URL: string;
  private readonly OUTPUT_DIR: string;
  private readonly TYPES_FILE: string;
  private readonly CLIENT_FILE: string;

  constructor(options: GenerateOptions = {}) {
    this.API_URL = options.apiUrl || process.env.API_URL || 'http://localhost:3001';
    this.OUTPUT_DIR = options.outputDir || join(__dirname, '../src');
    this.TYPES_FILE = join(this.OUTPUT_DIR, 'api-types.ts');
    this.CLIENT_FILE = join(this.OUTPUT_DIR, 'client.ts');

    // 출력 디렉토리 생성
    if (!existsSync(this.OUTPUT_DIR)) {
      mkdirSync(this.OUTPUT_DIR, { recursive: true });
    }
  }

  /**
   * OpenAPI 스키마 가져오기
   */
  async fetchOpenAPISchema(): Promise<any> {
    try {
      console.log(`[API] OpenAPI 스키마를 가져오는 중... ${this.API_URL}/api-json`);
      
      const response = await axios.get(`${this.API_URL}/api-json`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.data || !response.data.openapi) {
        throw new Error('유효하지 않은 OpenAPI 스키마');
      }

      console.log('[OK] OpenAPI 스키마 가져오기 성공');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`API 서버에 연결할 수 없습니다. ${this.API_URL}에서 API 서버가 실행 중인지 확인해주세요.`);
        }
        throw new Error(`API 요청 실패: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('알 수 없는 에러가 발생했습니다.');
    }
  }

  /**
   * openapi-typescript를 사용하여 타입 생성
   */
  async generateTypes(schema: any): Promise<void> {
    console.log('[WORK] TypeScript 타입을 생성하는 중...');

    try {
      // 스키마를 임시 파일로 저장
      const tempSchemaFile = join(this.OUTPUT_DIR, 'temp-schema.json');
      writeFileSync(tempSchemaFile, JSON.stringify(schema, null, 2));

      // openapi-typescript 실행
      await execAsync(`npx openapi-typescript ${tempSchemaFile} --output ${this.TYPES_FILE}`);

      // 임시 파일 삭제
      const fs = require('fs');
      if (fs.existsSync(tempSchemaFile)) {
        fs.unlinkSync(tempSchemaFile);
      }

      console.log('[OK] TypeScript 타입 생성 완료');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`타입 생성 실패: ${error.message}`);
      }
      throw new Error('타입 생성 실패: 알 수 없는 에러');
    }
  }

  /**
   * Axios 기반 클라이언트 생성
   */
  generateAxiosClient(): void {
    console.log('[WORK] Axios 클라이언트를 생성하는 중...');

    const clientCode = `/**
 * 자동 생성된 API 클라이언트
 * 이 파일을 직접 수정하지 마세요.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { paths } from './api-types';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export class AllInfluencerApiClient {
  private client: AxiosInstance;
  private tokens: AuthTokens = {};
  private refreshPromise: Promise<void> | null = null;

  constructor(config: ApiClientConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || 'http://localhost:3001/api/v1',
      timeout: config.timeout || 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  /**
   * 인터셉터 설정
   */
  private setupInterceptors() {
    // 요청 인터셉터: JWT 토큰 자동 주입
    this.client.interceptors.request.use(
      (config) => {
        if (this.tokens.accessToken) {
          config.headers.Authorization = \`Bearer \${this.tokens.accessToken}\`;
        }
        
        console.log(\`[REQ] [\${config.method?.toUpperCase()}] \${config.url}\`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 401 에러 시 토큰 갱신
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(\`[OK] [\${response.status}] \${response.config.url}\`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.tokens.refreshToken && !this.refreshPromise) {
            originalRequest._retry = true;
            
            try {
              await this.refreshTokens();
              return this.client(originalRequest);
            } catch (refreshError) {
              this.clearTokens();
              return Promise.reject(refreshError);
            }
          }
        }

        // 401 에러는 로그인하지 않은 상태에서 정상적인 응답이므로 조용히 처리
        if (error.response?.status !== 401) {
          console.error(\`[FAIL] [\${error.response?.status || 'Network'}] \${originalRequest?.url}\`, 
                       error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 토큰 설정
   */
  setTokens(tokens: AuthTokens): void {
    this.tokens = { ...tokens };
  }

  /**
   * 토큰 가져오기
   */
  getTokens(): AuthTokens {
    return { ...this.tokens };
  }

  /**
   * 토큰 초기화
   */
  clearTokens(): void {
    this.tokens = {};
  }

  /**
   * 토큰 갱신
   */
  private async refreshTokens(): Promise<void> {
    if (!this.tokens.refreshToken) {
      throw new Error('Refresh token이 없습니다');
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const response = await this.client.post('/auth/refresh', {
      refreshToken: this.tokens.refreshToken,
    });

    const { accessToken, refreshToken } = response.data;
    this.setTokens({ accessToken, refreshToken });
  }

  // ==================== 인증 API ====================
  
  /**
   * 회원가입
   */
  async signUp(data: any): Promise<any> {
    const response = await this.client.post('/auth/signup', data);
    const { accessToken, refreshToken } = response.data;
    this.setTokens({ accessToken, refreshToken });
    return response.data;
  }

  /**
   * 로그인
   */
  async login(data: { email: string; password: string }): Promise<any> {
    const response = await this.client.post('/auth/login', data);
    const { accessToken, refreshToken } = response.data;
    this.setTokens({ accessToken, refreshToken });
    return response.data;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<any> {
    if (!this.tokens.refreshToken) {
      return { message: '이미 로그아웃되었습니다.' };
    }

    try {
      const response = await this.client.post('/auth/logout', {
        refreshToken: this.tokens.refreshToken,
      });
      this.clearTokens();
      return response.data;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  /**
   * 현재 사용자 정보
   */
  async getMe(): Promise<any> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // ==================== 사용자 API ====================

  /**
   * 사용자 목록 조회
   */
  async getUsers(params?: any): Promise<any> {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  /**
   * 사용자 상세 조회
   */
  async getUser(id: string): Promise<any> {
    const response = await this.client.get(\`/users/\${id}\`);
    return response.data;
  }

  /**
   * 사용자 생성
   */
  async createUser(data: any): Promise<any> {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  /**
   * 사용자 수정
   */
  async updateUser(id: string, data: any): Promise<any> {
    const response = await this.client.patch(\`/users/\${id}\`, data);
    return response.data;
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(id: string): Promise<any> {
    const response = await this.client.delete(\`/users/\${id}\`);
    return response.data;
  }

  // ==================== Raw 요청 메서드 ====================

  /**
   * Raw GET 요청
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  /**
   * Raw POST 요청
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  /**
   * Raw PATCH 요청
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  /**
   * Raw DELETE 요청
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// 기본 인스턴스 생성
export const apiClient = new AllInfluencerApiClient();

// 편의 함수들
export const authApi = {
  signUp: (data: any) => apiClient.signUp(data),
  login: (data: { email: string; password: string }) => apiClient.login(data),
  logout: () => apiClient.logout(),
  getMe: () => apiClient.getMe(),
};

export const usersApi = {
  getAll: (params?: any) => apiClient.getUsers(params),
  getById: (id: string) => apiClient.getUser(id),
  create: (data: any) => apiClient.createUser(data),
  update: (id: string, data: any) => apiClient.updateUser(id, data),
  delete: (id: string) => apiClient.deleteUser(id),
};
`;

    writeFileSync(this.CLIENT_FILE, clientCode);
    console.log('[OK] Axios 클라이언트 생성 완료');
  }

  /**
   * 인덱스 파일 생성
   */
  generateIndexFile(): void {
    const indexContent = `/**
 * All Influencer API SDK
 * 자동 생성된 파일입니다.
 */

export * from './client';
export type * from './api-types';
`;

    const indexFile = join(this.OUTPUT_DIR, 'index.ts');
    writeFileSync(indexFile, indexContent);
    console.log('[OK] 인덱스 파일 생성 완료');
  }

  /**
   * 전체 생성 프로세스 실행
   */
  async generate(): Promise<void> {
    try {
      console.log('[START] All Influencer SDK 생성을 시작합니다...');
      console.log(`[DIR] 출력 디렉토리: ${this.OUTPUT_DIR}`);
      
      const schema = await this.fetchOpenAPISchema();
      await this.generateTypes(schema);
      this.generateAxiosClient();
      this.generateIndexFile();

      console.log('');
      console.log('[DONE] SDK 생성이 완료되었습니다!');
      console.log(`[DIR] 생성된 파일:`);
      console.log(`   - ${this.TYPES_FILE}`);
      console.log(`   - ${this.CLIENT_FILE}`);
      console.log(`   - ${join(this.OUTPUT_DIR, 'index.ts')}`);
      console.log('');
      console.log('[TIP] 사용 예시:');
      console.log('   import { apiClient, authApi, usersApi } from "@all-influencer/sdk";');
      console.log('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('[FAIL] SDK 생성 실패:', message);
      process.exit(1);
    }
  }
}

// CLI로 실행되었을 때
if (require.main === module) {
  const generator = new SDKGenerator({
    apiUrl: process.env.API_URL,
    verbose: process.argv.includes('--verbose'),
  });

  generator.generate().catch((error) => {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('실행 중 오류:', message);
    process.exit(1);
  });
}

export default SDKGenerator;

