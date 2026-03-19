import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // ✅ strongly recommended
  app.setGlobalPrefix('api');

  const server = app.getHttpAdapter().getInstance();

  server.get(/.*/, (req, res, next) => {
    // 🚫 NEVER touch API
    if (req.path.startsWith('/api')) {
      return next();
    }

    // 🚫 skip static assets
    if (req.path.includes('.') || req.path.startsWith('/assets')) {
      return next();
    }

    // ✅ everything else = frontend
    return res.sendFile(join(__dirname, '.', 'src', 'published', 'index.html'));
  });

  await app.listen(3000);
}
bootstrap();