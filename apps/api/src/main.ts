import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    // Render and most PaaS require binding to 0.0.0.0 to receive external traffic
    const port = parseInt(process.env.PORT ?? '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'https://recipebuilder-fuc3.onrender.com', 'recipe-builder.vjgcs.workers.dev'],
      credentials: true,
    });

    await app.listen(port, host);
    console.log(`Listening on ${host}:${port}`);
  } catch (err) {
    console.error('Bootstrap failed:', err);
    throw err;
  }
}

void bootstrap();
