import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('데이터베이스 연결을 시작합니다...');

    // 로그 이벤트 리스너 설정 (타입 안전성 개선)
    this.$on('query' as never, (e: any) => {
      this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(`Database Error: ${e.message}`, e.target);
    });

    this.$on('info' as never, (e: any) => {
      this.logger.log(`Database Info: ${e.message}`);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Database Warning: ${e.message}`);
    });

    try {
      await this.$connect();
      this.logger.log('✅ 데이터베이스 연결이 성공적으로 완료되었습니다.');
    } catch (error) {
      this.logger.error('❌ 데이터베이스 연결에 실패했습니다:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('데이터베이스 연결을 종료합니다...');
    await this.$disconnect();
    this.logger.log('✅ 데이터베이스 연결이 종료되었습니다.');
  }

  /**
   * 트랜잭션 실행 헬퍼 (기본 버전)
   */
  async runTransaction(fn: any) {
    return this.$transaction(fn);
  }

  /**
   * 헬스 체크 - 데이터베이스 연결 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * 데이터베이스 정보 조회
   */
  async getDatabaseInfo(): Promise<{ version: string; currentTime: Date }> {
    try {
      const result = await this.$queryRaw<Array<{ version: string; now: Date }>>`
        SELECT version() as version, NOW() as now
      `;
      
      return {
        version: result[0].version,
        currentTime: result[0].now,
      };
    } catch (error) {
      this.logger.error('Failed to get database info:', error);
      throw error;
    }
  }
}