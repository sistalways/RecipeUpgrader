import { Injectable ,ForbiddenException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {RecipeCreateIn,RecipeOut} from '@repo/api/recipes/dto/recipes.dto'
@Injectable()
export class RecipesService {
    constructor(private prisma: PrismaService) { }
    findAll() {
        return this.prisma.recipes.findMany(
            {
                include:{Ingredients: true}
            }
        );
    }

    findOne(id: number) {
        return this.prisma.recipes.findUnique({
            where: { id},
            include: { Ingredients: true },
        });
    }

    async create(recipe:RecipeCreateIn): Promise<RecipeOut> {
        return this.prisma.recipes.create({
            data:{
                recipeName:recipe.recipeName
            },
        });
    }

    async remove(id: number) {
        const record = await this.prisma.recipes.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('BMI record not found');
    }
    //if (record.userId !== userId) {
     // throw new ForbiddenException('You can only delete your own BMI records');
   // }

    return this.prisma.recipes.delete({ where: { id } });
    }

}
