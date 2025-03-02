import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { envs, SERVICES } from "src/config";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICES.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.productsMicroserviceHost,
          port: envs.productsMicroservicePort
        }
      }
    ])
  ],
  exports: [
    ClientsModule.register([
      {
        name: SERVICES.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.productsMicroserviceHost,
          port: envs.productsMicroservicePort
        }
      }
    ])
  ]
})
export class TcpProductsModule {}