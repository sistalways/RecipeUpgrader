import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';


@Controller('recipes')
export class RecipesController {
    constructor(
        private recipeService: RecipesService
        ) { }

    @Get()
    findAll() {
        return this.recipeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.recipeService.findOne(+id);
    }

    @Post()
    create(@Body() s) {
        return this.recipeService.create(s);
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.recipeService.remove(+id);
    }
}
