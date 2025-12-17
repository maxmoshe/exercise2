import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect Kafka microservice
  const kafkaBrokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'management-api',
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: 'management-api-consumer-group',
      },
      subscribe: {
        topics: ['buyOrders'],
        fromBeginning: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 8081);
}
bootstrap();
