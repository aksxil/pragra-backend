import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  // Logged-in user
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // Purchased product
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  // Amount paid
  @Prop({ required: true })
  amount: number;

  // Stripe session reference
  @Prop({ required: true })
  stripeSessionId: string;

  // Payment status
  @Prop({ default: 'paid', enum: ['pending', 'paid', 'failed'] })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
