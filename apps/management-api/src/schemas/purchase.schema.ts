import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  timestamp!: number;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
