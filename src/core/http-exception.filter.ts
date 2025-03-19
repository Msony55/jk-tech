import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    console.log(exception);

    let message = null;

    if (exception) {
      if (exception.getResponse()) {
        if (
          exception.getResponse()['message'] != null &&
          exception.getResponse()['message'].constructor === Array
        ) {
          message = exception.getResponse()['message'].join();
        } else {
          message = exception.getResponse()['message'];
        }
      }
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
