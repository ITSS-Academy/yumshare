import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Recipe } from '../../recipes/entities/recipe.entity/recipe.entity';

@Entity('likes')
@Unique(['user_id', 'recipe_id'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  recipe_id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.id, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
