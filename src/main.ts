import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
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

    return res.sendFile(join(process.cwd(), 'published', 'index.html')); // dont change this
  });

  await app.listen(Number(process.env.PORT) || 3000);
}

bootstrap();
