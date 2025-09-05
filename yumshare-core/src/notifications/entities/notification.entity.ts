import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
} 