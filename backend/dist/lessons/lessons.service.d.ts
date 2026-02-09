import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Lesson } from './lesson.entity';
export declare class LessonsService {
    private lessonsRepository;
    private configService;
    constructor(lessonsRepository: Repository<Lesson>, configService: ConfigService);
    findAll(): Promise<Lesson[]>;
    findLive(): Promise<Lesson[]>;
    findUpcoming(): Promise<Lesson[]>;
    findOne(id: string): Promise<Lesson>;
    create(lessonData: Partial<Lesson>): Promise<Lesson>;
    update(id: string, lessonData: Partial<Lesson>): Promise<Lesson>;
    remove(id: string): Promise<void>;
    startLesson(id: string): Promise<Lesson>;
    endLesson(id: string): Promise<Lesson>;
    generateToken(channelName: string, uid: number, role: 'host' | 'audience'): string;
    getTokenForLesson(id: string, role: 'host' | 'audience'): Promise<{
        token: string;
        channelName: string;
        uid: number;
        appId: string;
    }>;
    joinLesson(id: string): Promise<Lesson>;
    leaveLesson(id: string): Promise<Lesson>;
    getStats(): Promise<{
        totalLessons: number;
        liveLessons: number;
        upcomingLessons: number;
    }>;
}
