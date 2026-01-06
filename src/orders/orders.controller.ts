import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from '../products/products.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  // ================= STRIPE CHECKOUT =================
  @UseGuards(JwtAuthGuard)
  @Post('checkout/:productId')
  async checkout(@Param('productId') productId: string, @Req() req) {
    const product = await this.productsService.findById(productId);
    return this.ordersService.createCheckout(product, req.user.userId);
  }

  // ================= ORDER HISTORY =================
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async myOrders(@Req() req) {
    return this.ordersService.getMyOrders(req.user.userId);
  }
}
