import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity/recipe.entity';
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.id, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;
}