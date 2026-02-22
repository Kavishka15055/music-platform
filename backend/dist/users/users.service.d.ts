import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    getApprovedTeachers(): Promise<User[]>;
    getTeacherById(id: string): Promise<User>;
    getPendingTeachers(): Promise<User[]>;
    approveTeacher(id: string): Promise<User>;
    rejectTeacher(id: string): Promise<User>;
    countPendingTeachers(): Promise<number>;
}
