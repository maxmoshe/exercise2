import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GetPurchasesResponse, BuyRequest, BuyResponse, PurchaseEvent } from '@challenge/types';
import { v4 as uuidv4 } from 'uuid';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly kafkaService: KafkaService
  ) { }

  async createBuyOrder(buyRequest: BuyRequest): Promise<BuyResponse> {
    const id = uuidv4();

    // Create PurchaseEvent from BuyRequest
    const purchaseEvent: PurchaseEvent = {
      id,
      username: buyRequest.username,
      userId: buyRequest.userId,
      price: buyRequest.price,
      timestamp: Date.now()
    };

    // Publish purchaseEvent to Kafka
    await this.kafkaService.publishPurchaseEvent(purchaseEvent);

    return { id };
  }

  // Proxies GET request to Customer Management API
  async getAllUserBuys(userId: string): Promise<GetPurchasesResponse> {
    const managementApiUrl = process.env.MANAGEMENT_API_URL || 'http://localhost:8081';
    const url = `${managementApiUrl}/purchases/${userId}`;

    const response = await firstValueFrom(
      this.httpService.get<GetPurchasesResponse>(url)
    );
    return response.data;

  }
}
