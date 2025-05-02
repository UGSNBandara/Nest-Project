/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { BasicProcessingModule } from './basic-processing.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BasicProcessingModule,
    {
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: 4001 },
    },
  );
  await app.listen();
  console.log('✅ Image Basic Processing Microservice is running on port 4001');
}
bootstrap();