import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // 🔐 Protected products list
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProducts() {
    return this.productsService.findAll();
  }

  // ⚠️ TEMPORARY: Seed products (REMOVE AFTER USE)
  @Get('seed')
  async seed() {
    await this.productsService.seedProducts();
    return { message: 'Products seeded successfully' };
  }
}
