import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcCustomExceptionFilter } from './common';

async function bootstrap() {
  const logger = new Logger('OrdersMS-Main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    }
  );

  app.useGlobalFilters( new RpcCustomExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true
    })
  )
  await app.listen();
  logger.log(`Server running on ${envs.port}`);
}
bootstrap();
