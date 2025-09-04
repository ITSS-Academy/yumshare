import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { Recipe } from '../../../recipes/entities/recipe.entity/recipe.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.id, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @CreateDateColumn()
  created_at: Date;
}