
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';

@Controller('ingredients')
export class IngredientsController {
    constructor(
        private ingredients: IngredientsService
        ) { }

        @Get()
        findAll() {
            return this.ingredients.findAll();  
        }
    
        @Get(':id')
        findOne(@Param('id') id: string) {
            return this.ingredients.findOne(+id);
        }
    
        @Post()
        create(@Body() s) {
            return this.ingredients.create(s);
        }
        @Post('Generate')
        generateFromForm(@Body() s) {
            const{FormData,RecipeId}=s;
            return this.ingredients.generateFromForm(FormData,RecipeId);
        }

        @Delete(':id')
        remove(@Param('id') id: string) {
            return this.ingredients.remove(+id);
        }
}
