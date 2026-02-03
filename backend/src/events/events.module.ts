/**
 * File: events.module.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Module definition for organization and dependency injection of event-related components.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
