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
        return this.prisma.ingredients.findMany();
    }

    findOne(id: number) {
        return this.prisma.ingredients.findUnique({
            where: { id },
        });
    }

    async create(ingredient:IngredientCreateIn): Promise<IngredientOut> {
        return this.prisma.ingredients.create({
            data:{
                ingredientName:ingredient.ingredientName,
                recipeId:ingredient.recipeId,
                ingredientQuantity: ingredient.ingredientQuantity,
                
            },
        });
    }

    async generateFromForm(FormData,RecipeId) {
        const aiResponse = await this.openaiService.generateIngredientsFromForm(FormData);

        console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

        const IngredientsToCreate = aiResponse.map((ingredient) => ({
            ingredientName: ingredient,
            recipeId: RecipeId,
            ingredientQuantity: ingredient.quantity 
        }));

        console.log('Ingredients to create:', JSON.stringify(IngredientsToCreate, null, 2));

        const createdIngredients = this.prisma.ingredients.createMany({
            data: IngredientsToCreate,
            skipDuplicates: true,
        });

        console.log('Created Ingredients count:', createdIngredients.count);


        return createdIngredients;
        
      }

    async remove(id: number) {
        return this.prisma.ingredients.delete({ where: { id } });
    }
}
