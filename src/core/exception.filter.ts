import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    const errorResponse = {
      timestamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      message: exception,
    };

    Logger.error(
      `${request.method} ${request.url} ${exception}`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    );

    response.status(400).json(errorResponse);
  }
}