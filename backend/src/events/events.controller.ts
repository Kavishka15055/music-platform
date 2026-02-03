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

  /**
   * Retrieves all events.
   * @returns A list of all events.
   */
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  /**
   * Retrieves upcoming events.
   * @returns A list of events scheduled for the future.
   */
  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  /**
   * Retrieves statistics for events.
   * @returns Statistics such as total count and registration numbers.
   */
  @Get('stats')
  getStats() {
    return this.eventsService.getStats();
  }

  /**
   * Retrieves a single event by ID.
   * @param id - The ID of the event.
   * @returns The event details if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  /**
   * Creates a new event.
   * @param eventData - The data for the new event.
   * @returns The created event.
   */
  @Post()
  create(@Body() eventData: any) {
    return this.eventsService.create(eventData);
  }

  /**
   * Updates an existing event by ID.
   * @param id - The ID of the event to update.
   * @param eventData - The updated data.
   * @returns The updated event.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() eventData: any) {
    return this.eventsService.update(id, eventData);
  }

  /**
   * Deletes an event by ID.
   * @param id - The ID of the event to delete.
   * @returns A confirmation message or the deleted item.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  /**
   * Registers a user for an event.
   * @param id - The ID of the event to register for.
   * @returns The registration status or the updated event.
   */
  @Post(':id/register')
  register(@Param('id') id: string) {
    return this.eventsService.register(id);
  }

}
