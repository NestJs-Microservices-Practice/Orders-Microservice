import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TcpProductsModule, NatsModule } from '../transports';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [TcpProductsModule, NatsModule],
})
export class OrdersModule {}
