import { Injectable ,ForbiddenException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {IngredientCreateIn,IngredientOut} from '@repo/api/ingredients/dto/ingredients.dto'
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class IngredientsService {
    constructor(private prisma: PrismaService
        ,private openaiService:OpenaiService
        
        ) { }
    findAll() {
        return this.prisma.ingredient.findMany();
    }

    findOne(id: number) {
        return this.prisma.ingredient.findUnique({
            where: { id },
        });
    }

    async create(ingredient: IngredientCreateIn): Promise<IngredientOut> {
        return this.prisma.ingredient.create({
            data: {
                ingredientName: ingredient.ingredientName ?? null,
                ingredientQuantity: ingredient.ingredientQuantity,
                recipe: { connect: { id: ingredient.recipeId } },
                User: { connect: { id: ingredient.userId } },
            },
        }) as Promise<IngredientOut>;
    }

    async generateFromForm(FormData: unknown, RecipeId: number, userId: number) {
        const aiResponse = await this.openaiService.generateIngredientsFromForm(FormData);

        console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

        const IngredientsToCreate = aiResponse.map((item: { name?: string; quantity?: number }) => ({
            ingredientName: item.name ?? null,
            ingredientQuantity: item.quantity ?? 0,
            recipeId: RecipeId,
            userId,
        }));

        console.log('Ingredients to create:', JSON.stringify(IngredientsToCreate, null, 2));

        const result = await this.prisma.ingredient.createMany({
            data: IngredientsToCreate,
            skipDuplicates: true,
        });

        console.log('Created Ingredients count:', result.count);

        return result;
    }

    async remove(id: number) {
        return this.prisma.ingredient.delete({ where: { id } });
    }
}
