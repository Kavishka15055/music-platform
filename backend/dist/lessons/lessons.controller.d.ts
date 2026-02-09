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
    findOne(id: string): Promise<import("./lesson.entity").Lesson>;
    getToken(id: string, role?: 'host' | 'audience'): Promise<{
        token: string;
        channelName: string;
        uid: number;
        appId: string;
    }>;
    create(lessonData: any): Promise<import("./lesson.entity").Lesson>;
    startLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    endLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    joinLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    leaveLesson(id: string): Promise<import("./lesson.entity").Lesson>;
    update(id: string, lessonData: any): Promise<import("./lesson.entity").Lesson>;
    remove(id: string): Promise<void>;
}
