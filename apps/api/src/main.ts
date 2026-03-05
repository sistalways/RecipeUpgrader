import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
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

bootstrap();