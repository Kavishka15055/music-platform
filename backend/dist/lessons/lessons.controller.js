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
exports.LessonsController = void 0;
const common_1 = require("@nestjs/common");
const lessons_service_1 = require("./lessons.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_entity_1 = require("../users/user.entity");
let LessonsController = class LessonsController {
    lessonsService;
    constructor(lessonsService) {
        this.lessonsService = lessonsService;
    }
    findAll() {
        return this.lessonsService.findAll();
    }
    findLive() {
        return this.lessonsService.findLive();
    }
    findUpcoming() {
        return this.lessonsService.findUpcoming();
    }
    getStats() {
        return this.lessonsService.getStats();
    }
    findByTeacher(teacherId) {
        return this.lessonsService.findByTeacher(teacherId);
    }
    getMyLessons(req) {
        return this.lessonsService.findByTeacher(req.user.id);
    }
    deleteReview(reviewId, body) {
        return this.lessonsService.deleteReview(reviewId, body.studentId);
    }
    findOne(id) {
        return this.lessonsService.findOne(id);
    }
    getToken(id, role = 'audience') {
        return this.lessonsService.getTokenForLesson(id, role);
    }
    getReviews(id) {
        return this.lessonsService.getReviews(id);
    }
    create(lessonData, req) {
        return this.lessonsService.create({
            ...lessonData,
            creatorId: req.user.id,
            instructor: `${req.user.firstName} ${req.user.lastName}`,
        });
    }
    startLesson(id) {
        return this.lessonsService.startLesson(id);
    }
    endLesson(id) {
        return this.lessonsService.endLesson(id);
    }
    joinLesson(id) {
        return this.lessonsService.joinLesson(id);
    }
    leaveLesson(id) {
        return this.lessonsService.leaveLesson(id);
    }
    createReview(id, reviewData) {
        return this.lessonsService.createReview(id, reviewData);
    }
    update(id, lessonData) {
        return this.lessonsService.update(id, lessonData);
    }
    remove(id) {
        return this.lessonsService.remove(id);
    }
};
exports.LessonsController = LessonsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "findLive", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "findByTeacher", null);
__decorate([
    (0, common_1.Get)('my-lessons'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "getMyLessons", null);
__decorate([
    (0, common_1.Delete)('reviews/:reviewId'),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/token'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "getToken", null);
__decorate([
    (0, common_1.Get)(':id/reviews'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "startLesson", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "endLesson", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "joinLesson", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "leaveLesson", null);
__decorate([
    (0, common_1.Post)(':id/reviews'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "createReview", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LessonsController.prototype, "remove", null);
exports.LessonsController = LessonsController = __decorate([
    (0, common_1.Controller)('v1/lessons'),
    __metadata("design:paramtypes", [lessons_service_1.LessonsService])
], LessonsController);
//# sourceMappingURL=lessons.controller.js.map