import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from './app.service';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { PurchaseEvent } from '@challenge/types';

describe('AppService', () => {
  let service: AppService;

  const mockPurchaseModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getModelToken('Purchase'),
          useValue: mockPurchaseModel,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('savePurchase', () => {
    it('should save a purchase to MongoDB', async () => {
      const purchaseEvent: PurchaseEvent = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        price: 99.99,
        timestamp: Date.now(),
      };

      mockPurchaseModel.create.mockResolvedValue(purchaseEvent);

      await service.savePurchase(purchaseEvent);

      expect(mockPurchaseModel.create).toHaveBeenCalledWith({
        id: purchaseEvent.id,
        username: purchaseEvent.username,
        userId: purchaseEvent.userId,
        price: purchaseEvent.price,
        timestamp: purchaseEvent.timestamp,
      });
    });
  });
});
