/**
 * Type: Entity
 * File: lesson-review.entity.ts
 * Description:
 *   Database entity for lesson reviews left by students.
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity()
export class LessonReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentName: string;

  @Column()
  studentId: string;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: string;
}
