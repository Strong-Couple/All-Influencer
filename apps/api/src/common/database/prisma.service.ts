import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

    // 로그 이벤트 리스너 설정
    this.$on('query', (e) => {
      this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
    });

    this.$on('error', (e) => {
      this.logger.error(`Database Error: ${e.message}`, e.target);
    });

    this.$on('info', (e) => {
      this.logger.log(`Database Info: ${e.message}`);
    });

    this.$on('warn', (e) => {
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

  // 트랜잭션 헬퍼 메서드
  async executeTransaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>
  ): Promise<T> {
    return this.$transaction(fn);
  }

  // 헬스 체크 메서드
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

