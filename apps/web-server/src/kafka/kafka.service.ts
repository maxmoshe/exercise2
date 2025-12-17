import { PurchaseEvent } from '@challenge/types';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Admin, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private admin: Admin;
  private producer: Producer;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

    this.kafka = new Kafka({
      clientId: 'web-server',
      brokers: brokers,
    });

    this.admin = this.kafka.admin();
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.initializeKafka();
  }

  private async initializeKafka() {
    try {
      // Connect admin client
      await this.admin.connect();
      this.logger.log('Kafka admin connected');

      // Create buyOrders topic with 2 partitions
      await this.createTopics();

      // Connect producer
      await this.producer.connect();
      this.logger.log('Kafka producer connected');

      await this.admin.disconnect();
    } catch (error) {
      this.logger.error('Failed to initialize Kafka', error);
      throw error;
    }
  }

  private async createTopics() {
    try {
      const topics = await this.admin.listTopics();

      if (!topics.includes('buyOrders')) {
        await this.admin.createTopics({
          topics: [
            {
              topic: 'buyOrders',
              numPartitions: 2,
              replicationFactor: 1,
            },
          ],
        });
        this.logger.log('Topic "buyOrders" created with 2 partitions');
      } else {
        this.logger.log('Topic "buyOrders" already exists');
      }
    } catch (error) {
      this.logger.error('Failed to create topics', error);
      throw error;
    }
  }

  async publishPurchaseEvent(event: PurchaseEvent) {
    try {
      await this.producer.send({
        topic: 'buyOrders',
        messages: [
          {
            key: event.userId,
            value: JSON.stringify(event),
          },
        ],
      });
      this.logger.log(`Published purchase event for user ${event.userId}`);
    } catch (error) {
      this.logger.error('Failed to publish purchase event', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }
}
