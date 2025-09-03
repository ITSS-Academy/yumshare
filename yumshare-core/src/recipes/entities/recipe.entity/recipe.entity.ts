// src/recipes/entities/recipe.entity/recipe.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { RecipeStep } from '../../../recipe-steps/entities/recipe-step.entity';
import { Category } from '../../../categories/entities/category.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  ingredients: string[];

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ type: 'int', default: 0 })
  total_cooking_time: number;

  @Column({ type: 'int', default: 0 })
  servings: number;

  @Column({ type: 'text', nullable: true })
  difficulty: string;

  @Column({ type: 'text', nullable: true })
  country: string;

  @Column({ nullable: true })
  category_id: string;



  @ManyToOne(() => Category, category => category.recipes, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => RecipeStep, step => step.recipe, { cascade: true })
  steps: RecipeStep[];

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}