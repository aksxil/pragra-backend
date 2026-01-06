import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  // Get all products
  async findAll() {
    return this.productModel.find();
  }

  // Get product by ID (used in Stripe checkout)
  async findById(productId: string) {
    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Seed products (run once, then remove route)
  async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count > 0) return;

    await this.productModel.insertMany([
      {
        title: 'iPhone 15',
        price: 999,
        description: 'Latest Apple iPhone',
        image: 'https://m.media-amazon.com/images/I/71d7rfSl0wL.jpg',
      },
      {
        title: 'MacBook Pro',
        price: 1999,
        description: 'Apple laptop',
        image: 'https://s.yimg.com/ny/api/res/1.2/SL324QY.pOFbRKoGHI0wKg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTE2MDA7aD0xMDMwO3E9NTA-/https://s.yimg.com/os/creatr-uploaded-images/2024-11/ac6669e0-9c7e-11ef-bffb-b5cce5d36e6a',
      },
      {
        title: 'AirPods Pro',
        price: 249,
        description: 'Noise cancelling earbuds',
        image: 'https://www.decalz.in/cdn/shop/files/AirPods_Pro_3M_Black_Camo_skins_wrap699_L_9fba1873-6c32-4be0-97f9-7280c5527bec.jpg?v=1712941972&width=2048',
      },
    ]);
  }
}
