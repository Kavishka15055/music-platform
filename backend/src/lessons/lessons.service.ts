/**
 * File: lessons.service.ts
 * Author: Kavishka Piyumal
 * Created: 2026-02-09
 * Description:
 *   Service providing business logic for live lesson management and Agora token generation.
 */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { Lesson, LessonStatus } from './lesson.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    private configService: ConfigService,
  ) {}

  /**
   * Retrieves all lessons from the database.
   */
  async findAll(): Promise<Lesson[]> {
    try {
      return await this.lessonsRepository.find({ order: { scheduledDate: 'DESC' } });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve lessons');
    }
  }

  /**
   * Retrieves all currently live lessons.
   */
  async findLive(): Promise<Lesson[]> {
    try {
      return await this.lessonsRepository.find({
        where: { status: LessonStatus.LIVE },
        order: { startedAt: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve live lessons');
    }
  }

  /**
   * Retrieves all upcoming scheduled lessons.
   */
  async findUpcoming(): Promise<Lesson[]> {
    try {
      return await this.lessonsRepository.find({
        where: { 
          status: LessonStatus.SCHEDULED,
          scheduledDate: MoreThan(new Date()),
        },
        order: { scheduledDate: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve upcoming lessons');
    }
  }

  /**
   * Finds a single lesson by its ID.
   */
  async findOne(id: string): Promise<Lesson> {
    try {
      const lesson = await this.lessonsRepository.findOneBy({ id });
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID "${id}" not found`);
      }
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve lesson');
    }
  }

  /**
   * Creates a new lesson with a unique channel name.
   */
  async create(lessonData: Partial<Lesson>): Promise<Lesson> {
    try {
      if (!lessonData.title) {
        throw new BadRequestException('Title is required');
      }
      
      // Generate unique channel name
      const channelName = `lesson_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const lesson = this.lessonsRepository.create({
        ...lessonData,
        channelName,
        status: LessonStatus.SCHEDULED,
      });
      
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create lesson');
    }
  }

  /**
   * Updates an existing lesson.
   */
  async update(id: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    try {
      await this.findOne(id);
      const { id: _, channelName: __, ...updateData } = lessonData as any;
      await this.lessonsRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to update lesson with ID "${id}"`);
    }
  }

  /**
   * Deletes a lesson.
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.lessonsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Lesson with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to delete lesson with ID "${id}"`);
    }
  }

  /**
   * Starts a lesson (changes status to LIVE).
   */
  async startLesson(id: string): Promise<Lesson> {
    try {
      const lesson = await this.findOne(id);
      
      if (lesson.status === LessonStatus.LIVE) {
        throw new BadRequestException('Lesson is already live');
      }
      
      if (lesson.status === LessonStatus.ENDED) {
        throw new BadRequestException('Cannot restart an ended lesson');
      }
      
      lesson.status = LessonStatus.LIVE;
      lesson.startedAt = new Date();
      
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to start lesson');
    }
  }

  /**
   * Ends a lesson (changes status to ENDED).
   */
  async endLesson(id: string): Promise<Lesson> {
    try {
      const lesson = await this.findOne(id);
      
      if (lesson.status !== LessonStatus.LIVE) {
        throw new BadRequestException('Can only end a live lesson');
      }
      
      lesson.status = LessonStatus.ENDED;
      lesson.endedAt = new Date();
      lesson.currentParticipants = 0;
      
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to end lesson');
    }
  }

  /**
   * Generates an Agora RTC token for the given channel and role.
   */
  generateToken(channelName: string, uid: number, role: 'host' | 'audience'): string {
    const appId = this.configService.get<string>('AGORA_APP_ID');
    const appCertificate = this.configService.get<string>('AGORA_APP_CERTIFICATE');
    
    if (!appId || !appCertificate) {
      throw new InternalServerErrorException('Agora credentials not configured');
    }
    
    const rtcRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    return RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs,
    );
  }

  /**
   * Gets token for a specific lesson.
   */
  async getTokenForLesson(id: string, role: 'host' | 'audience'): Promise<{ token: string; channelName: string; uid: number; appId: string }> {
    const lesson = await this.findOne(id);
    const uid = Math.floor(Math.random() * 100000);
    const token = this.generateToken(lesson.channelName, uid, role);
    const appId = this.configService.get<string>('AGORA_APP_ID');
    
    return {
      token,
      channelName: lesson.channelName,
      uid,
      appId: appId || '',
    };
  }

  /**
   * Increments participant count when a user joins.
   */
  async joinLesson(id: string): Promise<Lesson> {
    try {
      const lesson = await this.findOne(id);
      
      if (lesson.status !== LessonStatus.LIVE) {
        throw new BadRequestException('Can only join a live lesson');
      }
      
      if (lesson.currentParticipants >= lesson.maxParticipants) {
        throw new BadRequestException('Lesson is full');
      }
      
      lesson.currentParticipants += 1;
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to join lesson');
    }
  }

  /**
   * Decrements participant count when a user leaves.
   */
  async leaveLesson(id: string): Promise<Lesson> {
    try {
      const lesson = await this.findOne(id);
      
      if (lesson.currentParticipants > 0) {
        lesson.currentParticipants -= 1;
      }
      
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to leave lesson');
    }
  }

  /**
   * Gets lesson statistics.
   */
  async getStats(): Promise<{ totalLessons: number; liveLessons: number; upcomingLessons: number }> {
    try {
      const totalLessons = await this.lessonsRepository.count();
      const liveLessons = await this.lessonsRepository.count({
        where: { status: LessonStatus.LIVE },
      });
      const upcomingLessons = await this.lessonsRepository.count({
        where: { 
          status: LessonStatus.SCHEDULED,
          scheduledDate: MoreThan(new Date()),
        },
      });
      
      return { totalLessons, liveLessons, upcomingLessons };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve lesson statistics');
    }
  }
}
