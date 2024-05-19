import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('topThree')
  topThreeRecipes(): Promise<Recipe[]> {
    return this.recipesService.topThreeRecipes();
  }
  @Get('recipe/:id')
  findOneRecipe(@Param('id', ParseIntPipe) id: number): Promise<Recipe> {
    return this.recipesService.findOneRecipe(id);
  }
}
