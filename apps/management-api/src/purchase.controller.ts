import type { PurchaseEvent } from '@challenge/types';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class PurchaseController {
  private readonly logger = new Logger(PurchaseController.name);

  constructor(private readonly appService: AppService) { }

  @MessagePattern('buyOrders')
  async handlePurchaseEvent(@Payload() purchaseEvent: PurchaseEvent) {
    this.logger.log(
      `Received purchase event: ${JSON.stringify(purchaseEvent)}`,
    );

    console.log(purchaseEvent)
    await this.appService.savePurchase(purchaseEvent);
  }
}
