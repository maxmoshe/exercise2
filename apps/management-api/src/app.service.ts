import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseEvent } from '@challenge/types';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async savePurchase(purchaseEvent: PurchaseEvent): Promise<void> {
    this.logger.log(`Saving purchase: ${JSON.stringify(purchaseEvent)}`);

    await this.purchaseModel.create({
      id: purchaseEvent.id,
      username: purchaseEvent.username,
      userId: purchaseEvent.userId,
      price: purchaseEvent.price,
      timestamp: purchaseEvent.timestamp,
    });

    this.logger.log(`Purchase saved to MongoDB for user ${purchaseEvent.userId}`);
  }

  async getPurchasesByUserId(userId: string): Promise<PurchaseEvent[]> {
    this.logger.log(`Fetching purchases for user: ${userId}`);

    const purchases = await this.purchaseModel.find({ userId }).exec();

    return purchases.map((purchase) => ({
      id: purchase.id,
      username: purchase.username,
      userId: purchase.userId,
      price: purchase.price,
      timestamp: purchase.timestamp,
    }));
  }
}
