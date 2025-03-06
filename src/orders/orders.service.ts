import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, PaginationOrderDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { SERVICES } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interfaces/order-with-products.interface';
import { url } from 'inspector';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(SERVICES.NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const productsIds = createOrderDto.items.map((item) => item.productId);

      // TODO: If the products ids not exists, throw an error
      // check why this throw an error unhandled
      const products = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, { ids: productsIds }),
      );

      const details = createOrderDto.items.map( orderItem => {
        return {
          price: products.find(
            (product) => product.id === orderItem.productId,
          ).price,
          productId: orderItem.productId,
          quantity: orderItem.quantity,
        }
      });

      // Calculate of the values of the products
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;
        return acc + price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      // Create transaction of db
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          orderItem: {
            createMany: {
              data: details,
            },
          },
        },
        include: {
          orderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            }
          }
        }
      });

      return {
        ...order,
        orderItem: order.orderItem.map( (orderItem) => ({
          ...orderItem,
          name: products.find( product => product.id === orderItem.productId).name
        }))
      };
    } catch (err) {
      throw new RpcException(err);
    }
  }

  async findAll(paginationOrderDto: PaginationOrderDto) {
    const { page, limit, status } = paginationOrderDto;
    const totalPages = await this.order.count({
      where: { status },
    });
    const currentPage = page;
    const data = await this.order.findMany({
      where: { status },
      skip: (currentPage - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: {
        totalItems: totalPages,
        itemsPerPage: limit,
        page: currentPage,
        totalPages: Math.ceil(totalPages / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
      include: {
        orderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    const productIds = order.orderItem.map((orderItem) => orderItem.productId);
    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, { ids: productIds, available: false }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    this.logger.log(products, 'Products-OrderService-findOne');
    const validateProducts = products.map((product) => product.id);
    const invalidProducts = productIds.filter(
      (productId) => !validateProducts.includes(productId),
    );
    this.logger.log({
      invalidProducts,
      productIds,
      validateProducts,
    }, 'Order-OrderService-findOne');
    return {
      ...order,
      orderItem: order.orderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }
    return this.order.update({
      where: { id },
      data: { status },
    });
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.client.send('create.payment.session', {
        orderId: order.id,
        currency: 'usd',
        items: order.orderItem.map((orderItem) => ({
            name: orderItem.name,
            price: orderItem.price,
            quantity: orderItem.quantity,
          })
        )
      }),
    );
    return {
      cancel_url: paymentSession.cancel_url,
      success_url: paymentSession.success_url,
      url: paymentSession.url,
    };
  }
}
