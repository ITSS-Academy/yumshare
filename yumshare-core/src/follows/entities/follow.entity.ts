import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('follows')
@Unique(['follower_id', 'following_id'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  follower_id: string; // User who is following

  @Column()
  following_id: string; // User being followed

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
