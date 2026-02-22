import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: 'text', default: ApprovalStatus.APPROVED })
  approvalStatus: ApprovalStatus;

  @Column({ nullable: true })
  qualifications: string;

  @Column({ nullable: true })
  teachingExperience: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
