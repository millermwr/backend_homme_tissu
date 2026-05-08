import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const defaultOrigins = [
    'https://homme-tissu-users.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow browserless tools (curl/Postman) and configured web origins.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
  });

  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  app.use('/uploads', express.static(uploadsPath));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
