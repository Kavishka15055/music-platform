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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = exports.LessonStatus = void 0;
const typeorm_1 = require("typeorm");
const lesson_review_entity_1 = require("./lesson-review.entity");
const user_entity_1 = require("../users/user.entity");
var LessonStatus;
(function (LessonStatus) {
    LessonStatus["SCHEDULED"] = "scheduled";
    LessonStatus["LIVE"] = "live";
    LessonStatus["ENDED"] = "ended";
})(LessonStatus || (exports.LessonStatus = LessonStatus = {}));
let Lesson = class Lesson {
    id;
    title;
    reviews;
    description;
    scheduledDate;
    duration;
    instructor;
    category;
    level;
    thumbnailUrl;
    status;
    channelName;
    maxParticipants;
    currentParticipants;
    creatorId;
    creator;
    createdAt;
    startedAt;
    endedAt;
};
exports.Lesson = Lesson;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Lesson.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Lesson.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lesson_review_entity_1.LessonReview, (review) => review.lesson),
    __metadata("design:type", Array)
], Lesson.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Lesson.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Lesson.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 60 }),
    __metadata("design:type", Number)
], Lesson.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Lesson.prototype, "instructor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'General' }),
    __metadata("design:type", String)
], Lesson.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'All Levels' }),
    __metadata("design:type", String)
], Lesson.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lesson.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        default: LessonStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Lesson.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Lesson.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Lesson.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Lesson.prototype, "currentParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lesson.prototype, "creatorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'creatorId' }),
    __metadata("design:type", user_entity_1.User)
], Lesson.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Lesson.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Lesson.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Lesson.prototype, "endedAt", void 0);
exports.Lesson = Lesson = __decorate([
    (0, typeorm_1.Entity)()
], Lesson);
//# sourceMappingURL=lesson.entity.js.map