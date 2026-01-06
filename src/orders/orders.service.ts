import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Order } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  // ================= CREATE STRIPE CHECKOUT =================
  async createCheckout(product: Product & { _id: Types.ObjectId }, userId: string) {
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.title,
                description: product.description,
              },
              unit_amount: product.price * 100,
            },
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:3001/success',
        cancel_url: 'http://localhost:3001/cancel',
      });

      await this.orderModel.create({
        userId: new Types.ObjectId(userId),
        productId: product._id,
        amount: product.price,
        stripeSessionId: session.id,
        status: 'pending',
      });

      return {
        checkoutUrl: session.url,
      };
    } catch (error) {
      throw new InternalServerErrorException('Stripe checkout failed');
    }
  }

  // ================= ORDER HISTORY =================
  async getMyOrders(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }
}
