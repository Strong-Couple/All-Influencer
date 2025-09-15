import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
    details?: any;
    stack?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.extractErrorInfo(exception);
    const requestId = request.headers['x-request-id'] as string;

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(requestId && { requestId }),
        ...(details && { details }),
        ...(process.env.NODE_ENV !== 'production' && 
            exception instanceof Error && 
            { stack: exception.stack }),
      },
    };

    // 에러 로깅
    this.logError(exception, request, status);

    response.status(status).json(errorResponse);
  }

  private extractErrorInfo(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: any;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();

      if (typeof response === 'string') {
        return {
          status,
          code: exception.constructor.name,
          message: response,
        };
      }

      const responseObj = response as any;
      return {
        status,
        code: responseObj.error || exception.constructor.name,
        message: responseObj.message || exception.message,
        details: responseObj.details,
      };
    }

    if (exception instanceof ThrottlerException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        code: 'RATE_LIMIT_EXCEEDED',
        message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    if (exception instanceof Error) {
      // 데이터베이스 에러 처리
      if (exception.message.includes('Unique constraint')) {
        return {
          status: HttpStatus.CONFLICT,
          code: 'DUPLICATE_RESOURCE',
          message: '이미 존재하는 리소스입니다.',
        };
      }

      if (exception.message.includes('Foreign key constraint')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'INVALID_REFERENCE',
          message: '참조하는 리소스가 존재하지 않습니다.',
        };
      }

      if (exception.message.includes('Record to update not found')) {
        return {
          status: HttpStatus.NOT_FOUND,
          code: 'RESOURCE_NOT_FOUND',
          message: '요청한 리소스를 찾을 수 없습니다.',
        };
      }
    }

    // 예상치 못한 에러
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
    };
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || '';

    const logContext = {
      method,
      url,
      ip,
      userAgent,
      requestId,
      status,
    };

    if (status >= 500) {
      this.logger.error(
        `Internal Server Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client Error: ${exception instanceof Error ? exception.message : 'Bad request'}`,
        JSON.stringify(logContext),
      );
    }
  }
}

