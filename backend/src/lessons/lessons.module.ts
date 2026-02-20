/**
 * File: lessons.module.ts
 * Author: Kavishka Piyumal
 * Created: 2026-02-09
 * Description:
 *   NestJS module for live lessons feature.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson } from './lesson.entity';
import { LessonReview } from './lesson-review.entity';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonReview])],
  controllers: [LessonsController],
  providers: [LessonsService, ChatGateway],
  exports: [LessonsService],
})
export class LessonsModule {}
