import { HttpException, HttpStatus } from "@nestjs/common";

export class AppException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorCode: string = "APP_ERROR"
  ) {
    super(
      {
        message: message,
        errorCode: errorCode,
        statusCode: statusCode,
      },
      statusCode
    );
  }
}