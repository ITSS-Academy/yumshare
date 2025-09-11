import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Recipe } from '../../recipes/entities/recipe.entity/recipe.entity';

@Entity('favorites')
@Unique(['user_id', 'recipe_id'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })  // Changed to text to match users.id
  user_id: string;

  @Column({ type: 'uuid' })  // Keep as uuid for recipes.id
  recipe_id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.id, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe | null;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
