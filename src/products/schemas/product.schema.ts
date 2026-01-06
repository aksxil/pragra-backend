import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  description: string;

  @Prop()
  image: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
