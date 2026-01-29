import { Controller, Get, Post, Param } from '@nestjs/common';
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

  @Post(':id/register')
  register(@Param('id') id: string) {
    return this.eventsService.register(id);
  }
}
