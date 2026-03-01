import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { OpenaiService } from 'src/openai/openai.service';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService,PrismaService,OpenaiService],
})
export class IngredientsModule {}
