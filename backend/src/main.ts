import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Vercel mints a new URL for production and for every branch/preview deploy,
  // so accept this project's *.vercel.app subdomains alongside the explicit list.
  const vercelDomain = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

  app.enableCors({
    // No Origin header means a non-browser caller (curl, server-side render).
    origin: (origin, callback) =>
      callback(
        null,
        !origin || allowedOrigins.includes(origin) || vercelDomain.test(origin),
      ),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
