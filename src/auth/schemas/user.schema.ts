import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  // Password optional because OAuth users may not have password
  @Prop()
  password?: string;

  // Email verification status
  @Prop({ default: false })
  isVerified: boolean;

  // Email verification token
  @Prop()
  verificationToken?: string;

  // Auth provider: local | google | facebook
  @Prop({ default: 'local' })
  provider: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
