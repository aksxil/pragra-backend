import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://pragra-frontend.vercel.app/', // frontend URL
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
