/**
 * File: events.controller.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Controller handling HTTP requests for event operations.
 */
import { Controller, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @Get('stats')
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  create(@Body() eventData: any) {
    return this.eventsService.create(eventData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() eventData: any) {
    return this.eventsService.update(id, eventData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  register(@Param('id') id: string) {
    return this.eventsService.register(id);
  }
}
