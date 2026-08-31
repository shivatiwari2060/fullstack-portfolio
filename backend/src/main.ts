import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // The production site and local dev always work; CORS_ORIGIN adds to this.
  const defaultOrigins = [
    'http://localhost:3000',
    'https://shivaprasadtiwari.com.np',
    'https://www.shivaprasadtiwari.com.np',
  ];

  const allowedOrigins = [
    ...new Set([
      ...defaultOrigins,
      ...(process.env.CORS_ORIGIN ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ]),
  ];

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
