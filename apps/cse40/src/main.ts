import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Image Processing API')
    .setDescription('API endpoints for various image processing operations')
    .setVersion('1.0')
    .addTag('basic-processing', 'Basic image processing operations')
    .addTag('enhancement', 'Image enhancement operations')
    .addTag('feature-detection', 'Image feature detection operations')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Main App running on http://localhost:3000');
}
bootstrap();
