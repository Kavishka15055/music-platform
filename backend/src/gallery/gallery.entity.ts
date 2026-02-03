/**
 * File: gallery.entity.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Database entity definition for gallery items.
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Gallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column()
  imageUrl: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: false })
  featured: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
