import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, UserRole, ApprovalStatus } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registerStudent(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.create({
      ...dto,
      password: hashedPassword,
      role: UserRole.STUDENT,
      approvalStatus: ApprovalStatus.APPROVED,
    });

    return { message: 'Student account created successfully' };
  }

  async registerTeacher(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    qualifications: string;
    teachingExperience: string;
    bio?: string;
  }): Promise<{ message: string }> {
    if (!dto.qualifications || !dto.teachingExperience) {
      throw new BadRequestException(
        'Qualifications and teaching experience are required for teachers',
      );
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.create({
      ...dto,
      password: hashedPassword,
      role: UserRole.TEACHER,
      approvalStatus: ApprovalStatus.PENDING,
    });

    return {
      message:
        'Teacher account created. Your profile is pending admin approval.',
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: Partial<User>;
  }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async validateUser(id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }
}
