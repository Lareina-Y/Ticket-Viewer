import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Dev purpose：enable CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Enable ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Automatically remove fields other than DTOs
      forbidNonWhitelisted: true, // Passing extra fields will cause an error
      transform: true,            // Automatically convert payload to DTO class instance + type conversion
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
