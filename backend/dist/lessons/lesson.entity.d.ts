import { LessonReview } from './lesson-review.entity';
import { User } from '../users/user.entity';
export declare enum LessonStatus {
    SCHEDULED = "scheduled",
    LIVE = "live",
    ENDED = "ended"
}
export declare class Lesson {
    id: string;
    title: string;
    reviews: LessonReview[];
    description: string;
    scheduledDate: Date;
    duration: number;
    instructor: string;
    category: string;
    level: string;
    thumbnailUrl: string;
    status: LessonStatus;
    channelName: string;
    maxParticipants: number;
    currentParticipants: number;
    creatorId: string;
    creator: User;
    createdAt: Date;
    startedAt: Date;
    endedAt: Date;
}
