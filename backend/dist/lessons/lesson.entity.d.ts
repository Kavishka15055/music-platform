export declare enum LessonStatus {
    SCHEDULED = "scheduled",
    LIVE = "live",
    ENDED = "ended"
}
export declare class Lesson {
    id: string;
    title: string;
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
    createdAt: Date;
    startedAt: Date;
    endedAt: Date;
}
