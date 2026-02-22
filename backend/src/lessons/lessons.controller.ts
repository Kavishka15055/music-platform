/**
 * File: lessons.controller.ts
 * Author: Kavishka Piyumal
 * Created: 2026-02-09
 * Description:
 *   Controller handling HTTP requests for live lesson operations.
 */
import { Controller, Get, Post, Param, Body, Patch, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('v1/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * Retrieves all lessons.
   */
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  /**
   * Retrieves currently live lessons.
   */
  @Get('live')
  findLive() {
    return this.lessonsService.findLive();
  }

  /**
   * Retrieves upcoming scheduled lessons.
   */
  @Get('upcoming')
  findUpcoming() {
    return this.lessonsService.findUpcoming();
  }

  /**
   * Retrieves lesson statistics.
   */
  @Get('stats')
  getStats() {
    return this.lessonsService.getStats();
  }

  /**
   * Retrieves lessons by a specific teacher.
   */
  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.lessonsService.findByTeacher(teacherId);
  }

  /**
   * Retrieves lessons for the current authenticated teacher.
   */
  @Get('my-lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getMyLessons(@Request() req: any) {
    return this.lessonsService.findByTeacher(req.user.id);
  }

  /**
   * Deletes a review (student can only delete their own).
   */
  @Delete('reviews/:reviewId')
  deleteReview(
    @Param('reviewId') reviewId: string,
    @Body() body: { studentId: string },
  ) {
    return this.lessonsService.deleteReview(reviewId, body.studentId);
  }

  /**
   * Retrieves a single lesson by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  /**
   * Gets Agora token for a lesson.
   */
  @Get(':id/token')
  getToken(
    @Param('id') id: string,
    @Query('role') role: 'host' | 'audience' = 'audience',
  ) {
    return this.lessonsService.getTokenForLesson(id, role);
  }

  /**
   * Gets reviews for a lesson.
   */
  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.lessonsService.getReviews(id);
  }

  /**
   * Creates a new lesson (teacher or admin only).
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() lessonData: any, @Request() req: any) {
    return this.lessonsService.create({
      ...lessonData,
      creatorId: req.user.id,
      instructor: `${req.user.firstName} ${req.user.lastName}`,
    });
  }

  /**
   * Starts a lesson (sets status to LIVE).
   */
  @Post(':id/start')
  startLesson(@Param('id') id: string) {
    return this.lessonsService.startLesson(id);
  }

  /**
   * Ends a lesson (sets status to ENDED).
   */
  @Post(':id/end')
  endLesson(@Param('id') id: string) {
    return this.lessonsService.endLesson(id);
  }

  /**
   * User joins a lesson.
   */
  @Post(':id/join')
  joinLesson(@Param('id') id: string) {
    return this.lessonsService.joinLesson(id);
  }

  /**
   * User leaves a lesson.
   */
  @Post(':id/leave')
  leaveLesson(@Param('id') id: string) {
    return this.lessonsService.leaveLesson(id);
  }

  /**
   * Creates a review for a lesson.
   */
  @Post(':id/reviews')
  createReview(
    @Param('id') id: string,
    @Body() reviewData: { studentName: string; studentId: string; rating: number; comment: string },
  ) {
    return this.lessonsService.createReview(id, reviewData);
  }

  /**
   * Updates an existing lesson.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() lessonData: any) {
    return this.lessonsService.update(id, lessonData);
  }

  /**
   * Deletes a lesson.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
