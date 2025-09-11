import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @Column({ primary: true, type: 'text' })
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: false })
  is_online: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_seen: Date;

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