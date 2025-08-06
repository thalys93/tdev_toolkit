import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiResponseBuilder,
  API_STATUS,
  ApiStatusType,
} from './api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let key = 'global/unknown-error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Se já é uma resposta padronizada, retorna ela
      if (typeof exceptionResponse === 'object' && 'key' in exceptionResponse) {
        return response.status(status).json(exceptionResponse);
      }

      message = exception.message;
      key = `global/http-${status}`;
    }

    // Log do erro
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Determinar o status baseado no código HTTP
    let apiStatus: ApiStatusType = API_STATUS.ERROR;
    if (status >= 400 && status < 500) {
      apiStatus =
        status === 404 ? API_STATUS.NOT_FOUND : API_STATUS.VALIDATION_ERROR;
    } else if (status >= 500) {
      apiStatus = API_STATUS.INTERNAL_ERROR;
    }

    const errorResponse = ApiResponseBuilder.error(
      message,
      apiStatus,
      status,
      key,
      'Erro não tratado capturado pelo filtro global',
      exception instanceof Error
        ? {
            name: exception.name,
            stack:
              process.env.NODE_ENV === 'development'
                ? exception.stack
                : undefined,
          }
        : exception,
    );

    response.status(status).json(errorResponse);
  }
}
