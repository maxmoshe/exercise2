import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000']; // Default to localhost for development

  app.enableCors({
    origin: corsOrigins,
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
