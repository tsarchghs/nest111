import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from '../src/app.module';

let cachedApp: INestApplication | null = null;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const server = app.getHttpAdapter().getInstance();

  server.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    if (req.path.includes('.') || req.path.startsWith('/assets')) {
      return next();
    }

    return res.sendFile(join(process.cwd(), 'client', 'dist', 'index.html'));
  });

  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}
