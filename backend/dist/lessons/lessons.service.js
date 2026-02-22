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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const agora_token_1 = require("agora-token");
const lesson_entity_1 = require("./lesson.entity");
const lesson_review_entity_1 = require("./lesson-review.entity");
let LessonsService = class LessonsService {
    lessonsRepository;
    reviewsRepository;
    configService;
    constructor(lessonsRepository, reviewsRepository, configService) {
        this.lessonsRepository = lessonsRepository;
        this.reviewsRepository = reviewsRepository;
        this.configService = configService;
    }
    async findAll() {
        try {
            return await this.lessonsRepository.find({
                order: { scheduledDate: 'DESC' },
                relations: ['reviews'],
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve lessons');
        }
    }
    async findLive() {
        try {
            return await this.lessonsRepository.find({
                where: { status: lesson_entity_1.LessonStatus.LIVE },
                order: { startedAt: 'ASC' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve live lessons');
        }
    }
    async findUpcoming() {
        try {
            return await this.lessonsRepository.find({
                where: {
                    status: lesson_entity_1.LessonStatus.SCHEDULED,
                    scheduledDate: (0, typeorm_2.MoreThan)(new Date()),
                },
                order: { scheduledDate: 'ASC' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve upcoming lessons');
        }
    }
    async findOne(id) {
        try {
            const lesson = await this.lessonsRepository.findOne({
                where: { id },
                relations: ['reviews'],
            });
            if (!lesson) {
                throw new common_1.NotFoundException(`Lesson with ID "${id}" not found`);
            }
            return lesson;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to retrieve lesson');
        }
    }
    async create(lessonData) {
        try {
            if (!lessonData.title) {
                throw new common_1.BadRequestException('Title is required');
            }
            const channelName = `lesson_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const lesson = this.lessonsRepository.create({
                ...lessonData,
                channelName,
                status: lesson_entity_1.LessonStatus.SCHEDULED,
            });
            return await this.lessonsRepository.save(lesson);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create lesson');
        }
    }
    async update(id, lessonData) {
        try {
            await this.findOne(id);
            const { id: _, channelName: __, ...updateData } = lessonData;
            await this.lessonsRepository.update(id, updateData);
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(`Failed to update lesson with ID "${id}"`);
        }
    }
    async remove(id) {
        try {
            const result = await this.lessonsRepository.delete(id);
            if (result.affected === 0) {
                throw new common_1.NotFoundException(`Lesson with ID "${id}" not found`);
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(`Failed to delete lesson with ID "${id}"`);
        }
    }
    async startLesson(id) {
        try {
            const lesson = await this.findOne(id);
            if (lesson.status === lesson_entity_1.LessonStatus.LIVE) {
                throw new common_1.BadRequestException('Lesson is already live');
            }
            if (lesson.status === lesson_entity_1.LessonStatus.ENDED) {
                throw new common_1.BadRequestException('Cannot restart an ended lesson');
            }
            lesson.status = lesson_entity_1.LessonStatus.LIVE;
            lesson.startedAt = new Date();
            return await this.lessonsRepository.save(lesson);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to start lesson');
        }
    }
    async endLesson(id) {
        try {
            const lesson = await this.findOne(id);
            if (lesson.status !== lesson_entity_1.LessonStatus.LIVE) {
                throw new common_1.BadRequestException('Can only end a live lesson');
            }
            lesson.status = lesson_entity_1.LessonStatus.ENDED;
            lesson.endedAt = new Date();
            lesson.currentParticipants = 0;
            return await this.lessonsRepository.save(lesson);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to end lesson');
        }
    }
    generateToken(channelName, uid, role) {
        const appId = this.configService.get('AGORA_APP_ID');
        const appCertificate = this.configService.get('AGORA_APP_CERTIFICATE');
        if (!appId || !appCertificate) {
            throw new common_1.InternalServerErrorException('Agora credentials not configured');
        }
        const rtcRole = role === 'host' ? agora_token_1.RtcRole.PUBLISHER : agora_token_1.RtcRole.SUBSCRIBER;
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        return agora_token_1.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, rtcRole, privilegeExpiredTs, privilegeExpiredTs);
    }
    async getTokenForLesson(id, role) {
        const lesson = await this.findOne(id);
        const uid = Math.floor(Math.random() * 100000);
        const token = this.generateToken(lesson.channelName, uid, role);
        const appId = this.configService.get('AGORA_APP_ID');
        return {
            token,
            channelName: lesson.channelName,
            uid,
            appId: appId || '',
        };
    }
    async joinLesson(id) {
        try {
            const lesson = await this.findOne(id);
            if (lesson.status !== lesson_entity_1.LessonStatus.LIVE) {
                throw new common_1.BadRequestException('Can only join a live lesson');
            }
            if (lesson.currentParticipants >= lesson.maxParticipants) {
                throw new common_1.BadRequestException('Lesson is full');
            }
            lesson.currentParticipants += 1;
            return await this.lessonsRepository.save(lesson);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to join lesson');
        }
    }
    async leaveLesson(id) {
        try {
            const lesson = await this.findOne(id);
            if (lesson.currentParticipants > 0) {
                lesson.currentParticipants -= 1;
            }
            return await this.lessonsRepository.save(lesson);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to leave lesson');
        }
    }
    async getStats() {
        try {
            const totalLessons = await this.lessonsRepository.count();
            const liveLessons = await this.lessonsRepository.count({
                where: { status: lesson_entity_1.LessonStatus.LIVE },
            });
            const upcomingLessons = await this.lessonsRepository.count({
                where: {
                    status: lesson_entity_1.LessonStatus.SCHEDULED,
                    scheduledDate: (0, typeorm_2.MoreThan)(new Date()),
                },
            });
            return { totalLessons, liveLessons, upcomingLessons };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve lesson statistics');
        }
    }
    async findByTeacher(teacherId) {
        try {
            return await this.lessonsRepository.find({
                where: { creatorId: teacherId },
                order: { scheduledDate: 'DESC' },
                relations: ['reviews'],
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve teacher lessons');
        }
    }
    async createReview(lessonId, data) {
        try {
            await this.findOne(lessonId);
            if (!data.rating || data.rating < 1 || data.rating > 5) {
                throw new common_1.BadRequestException('Rating must be between 1 and 5');
            }
            const review = this.reviewsRepository.create({
                ...data,
                lessonId,
            });
            return await this.reviewsRepository.save(review);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create review');
        }
    }
    async getReviews(lessonId) {
        try {
            return await this.reviewsRepository.find({
                where: { lessonId },
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve reviews');
        }
    }
    async deleteReview(reviewId, studentId) {
        try {
            const review = await this.reviewsRepository.findOneBy({ id: reviewId });
            if (!review) {
                throw new common_1.NotFoundException('Review not found');
            }
            if (review.studentId !== studentId) {
                throw new common_1.ForbiddenException('You can only delete your own reviews');
            }
            await this.reviewsRepository.delete(reviewId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to delete review');
        }
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lesson_entity_1.Lesson)),
    __param(1, (0, typeorm_1.InjectRepository)(lesson_review_entity_1.LessonReview)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map