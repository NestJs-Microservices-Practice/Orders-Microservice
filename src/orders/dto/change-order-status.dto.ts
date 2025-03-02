import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";

export class ChangeOrderStatusDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEnum(OrderStatusList, {
    message: `Valid status values are ${OrderStatusList}`
  })
  status: OrderStatus;
}