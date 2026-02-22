import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getApprovedTeachers(): Promise<import("./user.entity").User[]>;
    getTeacherById(id: string): Promise<import("./user.entity").User>;
    getPendingTeachers(): Promise<import("./user.entity").User[]>;
    countPendingTeachers(): Promise<number>;
    approveTeacher(id: string): Promise<import("./user.entity").User>;
    rejectTeacher(id: string): Promise<import("./user.entity").User>;
    getProfile(req: any): Promise<import("./user.entity").User | null>;
}
