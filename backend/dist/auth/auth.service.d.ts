import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    registerStudent(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }): Promise<{
        message: string;
    }>;
    registerTeacher(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        qualifications: string;
        teachingExperience: string;
        bio?: string;
    }): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: Partial<User>;
    }>;
    validateUser(id: string): Promise<User | null>;
}
