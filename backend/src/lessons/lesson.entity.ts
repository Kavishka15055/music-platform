/**
 * Type: Entity
 * File: lesson.entity.ts
 * Author: Kavishka Piyumal
 * Created: 2026-02-09
 * Description:
 *   Database entity definition for live video/audio lessons.
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { LessonReview } from './lesson-review.entity';
import { User } from '../users/user.entity';

export enum LessonStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
}

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @OneToMany(() => LessonReview, (review) => review.lesson)
  reviews: LessonReview[];

  @Column('text')
  description: string;

  @Column()
  scheduledDate: Date;

  @Column({ default: 60 })
  duration: number; // in minutes

  @Column()
  instructor: string;

  @Column({ default: 'General' })
  category: string;

  @Column({ default: 'All Levels' })
  level: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({
    type: 'text',
    default: LessonStatus.SCHEDULED,
  })
  status: LessonStatus;

  @Column({ unique: true })
  channelName: string;

  @Column({ default: 100 })
  maxParticipants: number;

  @Column({ default: 0 })
  currentParticipants: number;

  @Column({ nullable: true })
  creatorId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;
}
