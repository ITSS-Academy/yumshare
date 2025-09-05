import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ListResult } from '../common/types/list-result.type';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { OptimizedQueryService } from '../common/services/optimized-query.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly optimizedQueryService: OptimizedQueryService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  /**
   * Find all users with optimized pagination
   */
  async findAll(queryOpts: QueryOptsDto = {}): Promise<ListResult<User>> {
    const { page = 1, size = 20 } = queryOpts;
    
    // Use optimized query service for better performance
    const result = await this.optimizedQueryService.executeOptimizedQuery(
      this.userRepository,
      queryOpts,
      {
        relations: [],
        maxRelations: 0,
        selectFields: ['id', 'username', 'email', 'avatar_url', 'bio', 'created_at'],
        enableCache: false
      }
    );

    const listResult = new ListResult(result.data, result.total, result.page, result.size);
    
    this.logger.log(`Users fetched: ${result.data.length} results, total: ${result.total}, page: ${result.page}`);
    
    return listResult;
  }

  /**
   * Find user by ID with minimal relations
   */
  async findOne(id: string) {
    return this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'username', 'email', 'avatar_url', 'bio', 'created_at', 'updated_at']
    });
  }

  /**
   * Find user by username with minimal data
   */
  async findByUsername(username: string) {
    return this.userRepository.findOne({ 
      where: { username },
      select: ['id', 'username', 'avatar_url', 'bio']
    });
  }

  /**
   * Find user by email with minimal data
   */
  async findByEmail(email: string) {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'username', 'email', 'avatar_url']
    });
  }

  /**
   * Search users with optimized query
   */
  async searchUsers(queryOpts: QueryOptsDto): Promise<ListResult<User>> {
    const { page = 1, size = 20, query = '' } = queryOpts;
    
    if (!query) {
      return this.findAll(queryOpts);
    }

    // Use custom query with search filter
    const result = await this.optimizedQueryService.executeCustomQuery(
      this.userRepository,
      {},
      queryOpts,
      {
        relations: [],
        maxRelations: 0,
        selectFields: ['id', 'username', 'avatar_url', 'bio']
      }
    );

    // Apply search filter
    const filteredData = result.data.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
    );

    const listResult = new ListResult(filteredData, filteredData.length, page, size);
    
    this.logger.log(`Users search: ${filteredData.length} results for query: "${query}"`);
    
    return listResult;
  }

  /**
   * Get user profile with minimal data for public view
   */
  async getPublicProfile(userId: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'username', 'avatar_url', 'bio', 'created_at']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get users by IDs with minimal data (for batch operations)
   */
  async findByIds(userIds: string[]) {
    if (!userIds.length) return [];
    
    return this.userRepository.findBy({ id: In(userIds) });
  }

  /**
   * Count total users (optimized)
   */
  async countUsers(): Promise<number> {
    return this.optimizedQueryService.getOptimizedCount(this.userRepository);
  }
}
