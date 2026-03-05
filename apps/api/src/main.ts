import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Log crashes so Render shows them (unhandledRejection often exits without our catch)
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});

async function bootstrap() {
  console.log('[api] bootstrap starting, PORT=%s', process.env.PORT);
  try {
    const app = await NestFactory.create(AppModule);

    const port = parseInt(process.env.PORT ?? '3000', 10);
    const host = '0.0.0.0';

    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://recipebuilder-fuc3.onrender.com',
        'https://recipe-builder.vjgcs.workers.dev'
      ],
      credentials: true,
    });

    await app.listen(port, host);

    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    console.error('Bootstrap failed:', err);
    throw err;
  }
}

void bootstrap();