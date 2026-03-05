import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || undefined;
    app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', "https://f25-cisc474-yellow.onrender.com", "https://f25-cisc474-yellow.saakethp.workers.dev"],
    credentials: true,
  });
  await app.listen(port, host);
}

void bootstrap();
