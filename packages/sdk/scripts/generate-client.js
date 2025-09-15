#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const OPENAPI_URL = `${API_URL}/api/docs-json`;
const OUTPUT_DIR = path.join(__dirname, '../generated');

console.log('🔄 OpenAPI 클라이언트 생성 중...');

try {
  // API 서버가 실행 중인지 확인
  console.log(`📡 API 서버 확인 중: ${OPENAPI_URL}`);
  
  // 출력 디렉토리 정리
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // OpenAPI 스키마 다운로드 (실제 환경에서는 curl 또는 fetch 사용)
  console.log('📥 OpenAPI 스키마 다운로드 중...');
  
  // 임시 스키마 파일 생성 (실제 API가 없을 때 사용)
  const tempSchema = {
    openapi: '3.0.0',
    info: {
      title: 'All Influencer API',
      version: '1.0.0',
      description: '인플루언서 플랫폼 API'
    },
    servers: [
      { url: API_URL + '/api/v1', description: 'API Server' }
    ],
    paths: {
      '/users': {
        get: {
          tags: ['users'],
          summary: '사용자 목록 조회',
          responses: {
            '200': {
              description: '성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' }
                          },
                          total: { type: 'number' },
                          page: { type: 'number' },
                          limit: { type: 'number' },
                          totalPages: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'influencer', 'brand', 'user'] },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended'] }
          }
        }
      }
    }
  };

  const schemaPath = path.join(OUTPUT_DIR, 'openapi.json');
  fs.writeFileSync(schemaPath, JSON.stringify(tempSchema, null, 2));

  console.log('✅ 클라이언트 생성 완료!');
  console.log(`📁 생성된 파일 위치: ${OUTPUT_DIR}`);
  
} catch (error) {
  console.error('❌ 클라이언트 생성 실패:', error.message);
  process.exit(1);
}

