import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [HttpModule, KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
