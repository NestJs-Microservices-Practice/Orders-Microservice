import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const rpcError = exception.getError();

    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {

      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return {
        ...rpcError,
        status,
      };
    }

    return {
      status: 500,
      message: rpcError,
      error: 'Internal Server Error',
    };
  }
}
