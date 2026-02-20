import { Lesson } from './lesson.entity';
export declare class LessonReview {
    id: string;
    studentName: string;
    studentId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    lesson: Lesson;
    lessonId: string;
}
