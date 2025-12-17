import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';
import type { BuyRequest, BuyResponse } from '@challenge/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('/buy')
  async createBuyOrder(@Body() buyRequest: BuyRequest): Promise<BuyResponse> {
    return this.appService.createBuyOrder(buyRequest);
  }

  @Get('/getAllUserBuys/:userId')
  getAllUserBuys(@Param('userId') userId: string) {
    return this.appService.getAllUserBuys(userId);
  }
}

