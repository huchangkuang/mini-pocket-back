import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { fail } from "../types/api-response";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as { message?: string | string[] }).message ?? exception.message;

      response
        .status(status)
        .json(fail(status, Array.isArray(message) ? message.join("; ") : message));
      return;
    }

    console.error(exception);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(fail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"));
  }
}
