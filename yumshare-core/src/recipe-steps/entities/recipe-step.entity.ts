// src/recipe-steps/entities/recipe-step.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity/recipe.entity';

@Entity('recipe_steps')
export class RecipeStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipe_id: string;

  @Column()
  step_number: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ type: 'int', default: 0 })
  cooking_time: number;

  @Column({ type: 'text', nullable: true })
  tips: string;

  @ManyToOne(() => Recipe, recipe => recipe.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}