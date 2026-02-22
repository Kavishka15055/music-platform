"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findByEmail(email) {
        return this.usersRepository.findOneBy({ email });
    }
    async findById(id) {
        return this.usersRepository.findOneBy({ id });
    }
    async create(userData) {
        const user = this.usersRepository.create(userData);
        return await this.usersRepository.save(user);
    }
    async getApprovedTeachers() {
        try {
            return await this.usersRepository.find({
                where: {
                    role: user_entity_1.UserRole.TEACHER,
                    approvalStatus: user_entity_1.ApprovalStatus.APPROVED,
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
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve teachers');
        }
    }
    async getTeacherById(id) {
        const teacher = await this.usersRepository.findOne({
            where: { id, role: user_entity_1.UserRole.TEACHER },
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
            throw new common_1.NotFoundException('Teacher not found');
        }
        return teacher;
    }
    async getPendingTeachers() {
        try {
            return await this.usersRepository.find({
                where: {
                    role: user_entity_1.UserRole.TEACHER,
                    approvalStatus: user_entity_1.ApprovalStatus.PENDING,
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
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve pending teachers');
        }
    }
    async approveTeacher(id) {
        const teacher = await this.usersRepository.findOne({
            where: { id, role: user_entity_1.UserRole.TEACHER },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        teacher.approvalStatus = user_entity_1.ApprovalStatus.APPROVED;
        return await this.usersRepository.save(teacher);
    }
    async rejectTeacher(id) {
        const teacher = await this.usersRepository.findOne({
            where: { id, role: user_entity_1.UserRole.TEACHER },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        teacher.approvalStatus = user_entity_1.ApprovalStatus.REJECTED;
        return await this.usersRepository.save(teacher);
    }
    async countPendingTeachers() {
        return await this.usersRepository.count({
            where: {
                role: user_entity_1.UserRole.TEACHER,
                approvalStatus: user_entity_1.ApprovalStatus.PENDING,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map