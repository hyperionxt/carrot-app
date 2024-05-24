import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
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
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
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
      this.eventEmitter.emit('recipeUpdated');

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
      const key = `allRecipes-key`;
      const recipesCached = await this.cacheManager.get<Recipe[]>(key);
      if (recipesCached) return recipesCached;
      const recipesFound = await this.recipeRepository.find({
        skip: offset,
        take: limit,
      });
      if (recipesFound.length === 0 || !recipesFound)
        throw new HttpException(
          'There are not recipes registered yet',
          HttpStatus.NO_CONTENT,
        );
      await this.cacheManager.set(key, recipesFound);
      return recipesFound;
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
      const key = `recipeFound-key-${id}`;
      const recipeCached = await this.cacheManager.get<Recipe>(key);
      if (recipeCached) return recipeCached;
      const recipeFound = await this.recipeRepository.findOne({
        where: { id: id },
      });
      if (!recipeFound)
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      recipeFound.clicks = recipeFound.clicks + 1;
      await this.cacheManager.set(key, recipeFound);
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
      const key = `recipeByIngredients-key-${ingredients}`;
      const recipesCached = await this.cacheManager.get<Recipe[]>(key);
      if (recipesCached) return recipesCached;
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
      await this.cacheManager.set(key, recipeFound);

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
      this.eventEmitter.emit('recipeUpdated', recipeFound);
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
      this.eventEmitter.emit('recipeUpdated', recipeFound);

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
      const key = `topThreeRecipes-key`;
      const recipesCached = await this.cacheManager.get<Recipe[]>(key);
      if (recipesCached) return recipesCached;
      const recipesFound = await this.recipeRepository.find({
        where: { favorites: MoreThan(100), clicks: MoreThan(50) },
        take: 3,
      });
      await this.cacheManager.set(key, recipesFound);

      return recipesFound;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @OnEvent('recipeUpdated')
  async handleRecipeUpdated(recipe: Recipe) {
    const ingredientsKey = `recipeByIngredients-key-${recipe.ingredients}`;
    await this.cacheManager.del(ingredientsKey);
    const topThree = `topThreeRecipes-key`;
    await this.cacheManager.del(topThree);
    const allRecipes = `allRecipes-key`;
    await this.cacheManager.del(allRecipes);
    const recipeFound = `recipeFound-key-${recipe.id}`;
    await this.cacheManager.del(recipeFound);
  }
}
