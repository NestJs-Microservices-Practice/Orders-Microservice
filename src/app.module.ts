import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { NatsModule } from './transports/nats.module';
import { TcpProductsModule } from './transports/tcp-products.module';

@Module({
  imports: [OrdersModule, NatsModule, TcpProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
