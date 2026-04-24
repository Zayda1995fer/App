import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones.
 * - No expone stack traces ni errores técnicos al usuario final
 * - Registra errores internamente con el Logger de NestJS
 * - Devuelve mensajes amigables y consistentes
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ha ocurrido un error interno. Intenta de nuevo.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        // class-validator devuelve array de mensajes
        if (Array.isArray(res.message)) {
          message = res.message[0]; // primer error de validación
        } else {
          message = res.message || message;
        }
      }
    }

    // Log interno — NO se envía al cliente
    this.logger.error(
      `[${request.method}] ${request.url} — ${status}: ${
        exception instanceof Error ? exception.message : String(exception)
      }`
    );

    // Respuesta limpia al cliente — sin stack trace
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

}
