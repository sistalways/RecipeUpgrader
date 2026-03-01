import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const host = process.env.HOST ;
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001',"https://recipebuilder-fuc3.onrender.com","recipe-builder.vjgcs.workers.dev" ],
    credentials: true,
  });
  await app.listen(port, host);
}

void bootstrap();
