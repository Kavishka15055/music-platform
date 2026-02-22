import { LessonsService } from './lessons.service';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    findAll(): Promise<import("./lesson.entity").Lesson[]>;
    findLive(): Promise<import("./lesson.entity").Lesson[]>;
    findUpcoming(): Promise<import("./lesson.entity").Lesson[]>;
    getStats(): Promise<{
        totalLessons: number;
        liveLessons: number;
        upcomingLessons: number;
    }>;
    findByTeacher(teacherId: string): Promise<import("./lesson.entity").Lesson[]>;
    getMyLessons(req: any): Promise<import("./lesson.entity").Lesson[]>;
    deleteReview(reviewId: string, body: {
        studentId: string;
    }): Promise<void>;
    findOne(id: string): Promise<import("./lesson.entity").Lesson>;
    getToken(id: string, role?: 'host' | 'audience'): Promise<{
        token: string;
        channelName: string;
        uid: number;
        appId: string;
    }>;
    getReviews(id: string): Promise<import("./lesson-review.entity").LessonReview[]>;
    create(lessonData: any, req: any): Promise<import("./lesson.entity").Lesson>;
    startLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    endLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    joinLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    leaveLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    createReview(id: string, reviewData: {
        studentName: string;
        studentId: string;
        rating: number;
        comment: string;
    }): Promise<import("./lesson-review.entity").LessonReview>;
    update(id: string, lessonData: any): Promise<import("./lesson.entity").Lesson>;
    remove(id: string): Promise<void>;
}
