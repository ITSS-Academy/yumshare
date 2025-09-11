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

  @CreateDateColumn({ 
    type: 'timestamp with time zone', 
    default: () => "timezone('Asia/Ho_Chi_Minh', now())",
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => value ? new Date(value.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })) : value
    }
  })
  created_at: Date;
} 