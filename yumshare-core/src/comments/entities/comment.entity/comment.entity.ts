import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity/recipe.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'text' })
  user_id: string;

  @Column({ name: 'recipeId', type: 'text' })
  recipe_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ 
    type: 'timestamp with time zone',
    default: () => "timezone('Asia/Ho_Chi_Minh', now())",
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => value ? new Date(value.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })) : value
    }
  })
  created_at: Date;

  @UpdateDateColumn({ 
    type: 'timestamp with time zone',
    default: () => "timezone('Asia/Ho_Chi_Minh', now())",
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => value ? new Date(value.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })) : value
    }
  })
  updated_at: Date;
}