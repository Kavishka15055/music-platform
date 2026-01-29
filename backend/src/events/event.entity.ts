import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  category: string;

  @Column()
  instrument: string;

  @Column()
  level: string;

  @Column()
  maxAttendees: number;

  @Column({ default: 0 })
  currentAttendees: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  imageUrl: string;
}
