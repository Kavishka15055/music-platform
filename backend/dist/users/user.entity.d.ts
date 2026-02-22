export declare enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ADMIN = "admin"
}
export declare enum ApprovalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    approvalStatus: ApprovalStatus;
    qualifications: string;
    teachingExperience: string;
    bio: string;
    profileImageUrl: string;
    createdAt: Date;
}
