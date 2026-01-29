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
