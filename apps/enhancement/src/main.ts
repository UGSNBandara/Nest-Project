/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { EnhancementModule } from './enhancement.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EnhancementModule,
    {
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: 4002 },
    },
  );
  await app.listen();
  console.log('✅ Image Processing Enhancement Microservice is running on port 4002');
}
bootstrap();