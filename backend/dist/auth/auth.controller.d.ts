import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: Partial<import("../users/user.entity").User>;
    }>;
    getProfile(req: any): any;
}
