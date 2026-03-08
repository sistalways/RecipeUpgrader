import { Injectable ,ForbiddenException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {RecipeCreateIn,RecipeOut} from '@repo/api/recipes/dto/recipes.dto'
@Injectable()
export class RecipesService {
    constructor(private prisma: PrismaService) { }
    findAll() {
        return this.prisma.recipe.findMany(
            {
                include: { ingredients: true }
            }
        );
    }

    findOne(id: number) {
        return this.prisma.recipe.findUnique({
            where: { id},
            include: { ingredients: true },
        });
    }

    async create(recipe: RecipeCreateIn): Promise<RecipeOut> {
        return this.prisma.recipe.create({
            data: {
                recipeName: recipe.recipeName,
                User: { connect: { id: 1 } },
            },
        }) as Promise<RecipeOut>;
    }

    async remove(id: number) {
        const record = await this.prisma.recipe.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('BMI record not found');
    }
    //if (record.userId !== userId) {
     // throw new ForbiddenException('You can only delete your own BMI records');
   // }

    return this.prisma.recipe.delete({ where: { id } });
    }

}
