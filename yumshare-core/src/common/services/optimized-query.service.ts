import { Injectable, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder, FindManyOptions, ObjectLiteral } from 'typeorm';
import { QueryOptsDto } from '../dto/query-opts.dto';

export interface OptimizedQueryOptions {
  selectFields?: string[];
  relations?: string[];
  maxRelations?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
  totalPages: number;
}

@Injectable()
export class OptimizedQueryService {
  private readonly logger = new Logger(OptimizedQueryService.name);

  /**
   * Execute optimized query with pagination and field selection
   */
  async executeOptimizedQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    queryOpts: QueryOptsDto = {},
    options: OptimizedQueryOptions = {}
  ): Promise<QueryResult<T>> {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    const { selectFields, relations = [], maxRelations = 3, enableCache = true } = options;

    const skip = (page - 1) * size;
    
    try {
      // Build optimized query
      const queryBuilder = this.buildOptimizedQuery(
        repository,
        queryOpts,
        { selectFields, relations, maxRelations, enableCache }
      );

      // Execute query with pagination
      const [data, total] = await queryBuilder
        .orderBy(`entity.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(size)
        .getManyAndCount();

      const totalPages = Math.ceil(total / size);
      const hasMore = page < totalPages;

      this.logger.log(
        `Optimized query executed: ${data.length} results, total: ${total}, page: ${page}/${totalPages}`
      );

      return {
        data,
        total,
        page,
        size,
        hasMore,
        totalPages
      };
    } catch (error) {
      this.logger.error(`Optimized query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build optimized query builder
   */
  buildOptimizedQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    queryOpts: QueryOptsDto = {},
    options: OptimizedQueryOptions = {}
  ): SelectQueryBuilder<T> {
    const { selectFields, relations = [], maxRelations = 3 } = options;
    
    // Limit relations to prevent over-fetching
    const limitedRelations = relations.slice(0, maxRelations);
    
    // Start with base query
    let queryBuilder = repository.createQueryBuilder('entity');

    // Add relations with field selection
    limitedRelations.forEach(relation => {
      queryBuilder = queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    // Add field selection if specified
    if (selectFields && selectFields.length > 0) {
      const fields = ['entity.id', ...selectFields.map(field => `entity.${field}`)];
      queryBuilder = queryBuilder.select(fields);
      
      // Add relation fields if needed
      limitedRelations.forEach(relation => {
        queryBuilder = queryBuilder.addSelect([
          `${relation}.id`,
          `${relation}.name`,
          `${relation}.username`
        ]);
      });
    }

    // Apply search filters
    this.applySearchFilters(queryBuilder, queryOpts);

    return queryBuilder;
  }

  /**
   * Apply search filters to query builder
   */
  private applySearchFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    queryOpts: QueryOptsDto
  ): void {
    const { query, category, author, difficulty, rating } = queryOpts;

    // Text search
    if (query) {
      queryBuilder = queryBuilder.where(
        '(entity.title ILIKE :query OR entity.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    // Category filter
    if (category) {
      if (/^[0-9a-fA-F-]{36}$/.test(category)) {
        queryBuilder = queryBuilder.andWhere('entity.category_id = :categoryId', { categoryId: category });
      } else {
        queryBuilder = queryBuilder.andWhere('category.name ILIKE :categoryName', { categoryName: `%${category}%` });
      }
    }

    // Author filter
    if (author) {
      if (/^[0-9a-fA-F-]{36}$/.test(author)) {
        queryBuilder = queryBuilder.andWhere('entity.user_id = :userId', { userId: author });
      } else {
        queryBuilder = queryBuilder.andWhere('user.username ILIKE :username', { username: `%${author}%` });
      }
    }

    // Difficulty filter
    if (difficulty) {
      queryBuilder = queryBuilder.andWhere('entity.difficulty = :difficulty', { difficulty });
    }

    // Rating filter
    if (rating) {
      queryBuilder = queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM ratings r WHERE r.recipe_id = entity.id AND r.rating >= :rating)',
        { rating }
      );
    }
  }

  /**
   * Execute simple optimized find with relations
   */
  async findOptimized<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: FindManyOptions<T> = {},
    maxRelations: number = 3
  ): Promise<T[]> {
    const { relations = [], ...otherOptions } = options;
    
    // Limit relations to prevent over-fetching
    const limitedRelations = Array.isArray(relations) ? relations.slice(0, maxRelations) : [];
    
    const optimizedOptions: FindManyOptions<T> = {
      ...otherOptions,
      relations: limitedRelations
    };

    return repository.find(optimizedOptions);
  }

  /**
   * Get optimized count query
   */
  async getOptimizedCount<T extends ObjectLiteral>(
    repository: Repository<T>,
    queryOpts: QueryOptsDto = {}
  ): Promise<number> {
    try {
      const queryBuilder = this.buildOptimizedQuery(repository, queryOpts, { relations: [] });
      return await queryBuilder.getCount();
    } catch (error) {
      this.logger.error(`Count query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute optimized query with custom filters
   */
  async executeCustomQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    customFilters: Record<string, any>,
    queryOpts: QueryOptsDto = {},
    options: OptimizedQueryOptions = {}
  ): Promise<QueryResult<T>> {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    const { selectFields, relations = [], maxRelations = 3 } = options;

    const skip = (page - 1) * size;
    
    try {
      let queryBuilder = repository.createQueryBuilder('entity');

      // Add relations
      const limitedRelations = relations.slice(0, maxRelations);
      limitedRelations.forEach(relation => {
        queryBuilder = queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
      });

      // Add field selection
      if (selectFields && selectFields.length > 0) {
        const fields = ['entity.id', ...selectFields.map(field => `entity.${field}`)];
        queryBuilder = queryBuilder.select(fields);
      }

      // Apply custom filters
      Object.entries(customFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryBuilder = queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      });

      // Execute query
      const [data, total] = await queryBuilder
        .orderBy(`entity.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(size)
        .getManyAndCount();

      const totalPages = Math.ceil(total / size);
      const hasMore = page < totalPages;

      return {
        data,
        total,
        page,
        size,
        hasMore,
        totalPages
      };
    } catch (error) {
      this.logger.error(`Custom query failed: ${error.message}`);
      throw error;
    }
  }
}
