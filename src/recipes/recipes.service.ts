import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { PaginationQueryDto } from '../pagination/pagination-query.dto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private recipeRepository: Repository<Recipe>,
  ) {}
  async createRecipe(recipe: CreateRecipeDto): Promise<Recipe> {
    try {
      const recipeFound = await this.recipeRepository.findOne({
        where: { title: recipe.title },
      });
      if (recipeFound) {
        throw new HttpException('Recipe already exist', HttpStatus.CONFLICT);
      }

      const newRecipe = this.recipeRepository.create(recipe);
      return await this.recipeRepository.save(newRecipe);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllRecipes({
    limit,
    offset,
  }: PaginationQueryDto): Promise<Recipe[]> {
    try {
      const userFavorites = await this.recipeRepository.find({
        skip: offset,
        take: limit,
      });
      if (userFavorites.length === 0 || !userFavorites)
        throw new HttpException(
          'There are not recipes registered yet',
          HttpStatus.NO_CONTENT,
        );
      return userFavorites;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneRecipe(id: number): Promise<Recipe> {
    try {
      const recipeFound = await this.recipeRepository.findOne({
        where: { id: id },
      });
      if (!recipeFound)
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      recipeFound.clicks = recipeFound.clicks + 1;
      return recipeFound;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByIngredients(
    ingredients: string[],
    orderBy: 'default' | 'country' = 'default',
  ): Promise<Recipe[]> {
    try {
      let queryBuilder = this.recipeRepository
        .createQueryBuilder('recipe')
        .where('recipe.ingredients::text[] @> ARRAY[:...ingredients]::text[]', {
          ingredients,
        });

      if (orderBy === 'country') {
        queryBuilder = queryBuilder.orderBy('recipe.country', 'ASC');
      }

      const recipeFound = await queryBuilder.getMany();

      if (!recipeFound || recipeFound.length === 0)
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      return recipeFound;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRecipe(id: number, recipe: UpdateRecipeDto): Promise<Recipe> {
    try {
      const recipeFound = await this.recipeRepository.findOne({
        where: { id: id },
      });
      if (!recipeFound)
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      if (recipe.ingredients !== undefined) {
        
        recipeFound.ingredients = recipe.ingredients;
      }
      const updateRecipe = Object.assign(recipeFound, recipe);
      return this.recipeRepository.save(updateRecipe);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeRecipe(id: number): Promise<HttpException> {
    try {
      const recipeFound = await this.recipeRepository.delete({ id });
      if (recipeFound.affected === 0)
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      return new HttpException('Recipe deleted', HttpStatus.OK);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async topThreeRecipes(): Promise<Recipe[]> {
    try {
      const recipesFound = await this.recipeRepository.find({
        where: { favorites: MoreThan(100), clicks: MoreThan(50) },
        take: 3,
      });

      return recipesFound;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
