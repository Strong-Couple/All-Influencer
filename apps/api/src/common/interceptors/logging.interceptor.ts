import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || '';
    const startTime = Date.now();

    const logData = {
      method,
      url,
      ip,
      userAgent,
      requestId,
    };

    this.logger.log(`📥 ${method} ${url}`, JSON.stringify(logData));

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          
          this.logger.log(
            `📤 ${method} ${url} - ${statusCode} - ${duration}ms`,
            JSON.stringify({ ...logData, statusCode, duration, hasData: !!data })
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error?.status || 500;
          
          this.logger.error(
            `💥 ${method} ${url} - ${statusCode} - ${duration}ms`,
            error?.message,
            JSON.stringify({ ...logData, statusCode, duration, error: error?.message })
          );
        },
      }),
    );
  }
}

