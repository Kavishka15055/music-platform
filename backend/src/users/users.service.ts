import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, ApprovalStatus } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async getApprovedTeachers(): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        where: {
          role: UserRole.TEACHER,
          approvalStatus: ApprovalStatus.APPROVED,
        },
        order: { createdAt: 'DESC' },
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'qualifications',
          'teachingExperience',
          'bio',
          'profileImageUrl',
          'createdAt',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve teachers');
    }
  }

  async getTeacherById(id: string): Promise<User> {
    const teacher = await this.usersRepository.findOne({
      where: { id, role: UserRole.TEACHER },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'qualifications',
        'teachingExperience',
        'bio',
        'profileImageUrl',
        'createdAt',
        'approvalStatus',
      ],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  async getPendingTeachers(): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        where: {
          role: UserRole.TEACHER,
          approvalStatus: ApprovalStatus.PENDING,
        },
        order: { createdAt: 'ASC' },
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'qualifications',
          'teachingExperience',
          'bio',
          'createdAt',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve pending teachers',
      );
    }
  }

  async approveTeacher(id: string): Promise<User> {
    const teacher = await this.usersRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    teacher.approvalStatus = ApprovalStatus.APPROVED;
    return await this.usersRepository.save(teacher);
  }

  async rejectTeacher(id: string): Promise<User> {
    const teacher = await this.usersRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    teacher.approvalStatus = ApprovalStatus.REJECTED;
    return await this.usersRepository.save(teacher);
  }

  async countPendingTeachers(): Promise<number> {
    return await this.usersRepository.count({
      where: {
        role: UserRole.TEACHER,
        approvalStatus: ApprovalStatus.PENDING,
      },
    });
  }
}
