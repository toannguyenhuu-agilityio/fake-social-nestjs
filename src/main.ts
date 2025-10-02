import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw error on unknown props
      transform: true, // auto-transform payloads into DTO instances
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
