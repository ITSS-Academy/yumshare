import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, JoinColumn } from 'typeorm';
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
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => value
    }
  })
  created_at: Date;

  @UpdateDateColumn({ 
    type: 'timestamp with time zone',
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => value
    }
  })
  updated_at: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.created_at = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updated_at = new Date();
  }
}