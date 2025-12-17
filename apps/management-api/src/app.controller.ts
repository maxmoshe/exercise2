import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { GetPurchasesResponse } from '@challenge/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // GET /purchases/:userId - Returns all user purchases from MongoDB
  @Get('purchases/:userId')
  async getPurchases(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<GetPurchasesResponse> {
    const purchases = await this.appService.getPurchasesByUserId(userId);
    return purchases
  }
}
