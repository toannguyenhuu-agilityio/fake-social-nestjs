import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw error on unknown props
      transform: true, // auto-transform payloads into DTO instances
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Fake Social API')
    .setDescription('API documentation for Fake Social app')
    .setVersion('1.0')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Cookies
  app.use(cookieParser());

  // CORS
  // Enable CORS for Frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // allow sending cookies
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
