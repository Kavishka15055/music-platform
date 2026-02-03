/**
 * File: events.service.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Service providing business logic for event management and data seeding.
 */
import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  /**
   * Lifecycle hook that runs when the module is initialized.
   * Seeds initial events data if the repository is empty.
   * Also ensures past events are shifted to the future for demonstration.
   */
  async onModuleInit() {
    try {
      // Seed data if empty
      const count = await this.eventsRepository.count();
      if (count === 0) {
        await this.seedEvents();
      } else {
         // Temporary fix: Update dates to future if they are in the past (for demo purposes)
         const events = await this.eventsRepository.find();
         const now = new Date();
         let updated = false;
         for (const event of events) {
           if (new Date(event.date) < now) {
              // Move to 2026 keeping same month/day
              const newDate = new Date(event.date);
              newDate.setFullYear(2026);
              event.date = newDate;
              await this.eventsRepository.save(event);
              updated = true;
           }
         }
         if (updated) console.log('Updated past events to 2026');
      }
    } catch (error) {
      console.error('Error during events module initialization:', error);
    }
  }

  /**
   * Retrieves all events from the database.
   * @returns A promise that resolves to an array of all events.
   */
  async findAll(): Promise<Event[]> {
    try {
      return await this.eventsRepository.find({ order: { date: 'ASC' } });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve events');
    }
  }

  /**
   * Finds events scheduled after the current date and time.
   * @returns A promise that resolves to an array of upcoming events.
   */
  async findUpcoming(): Promise<Event[]> {
    try {
      return await this.eventsRepository.find({
        where: { date: MoreThan(new Date()) },
        order: { date: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve upcoming events');
    }
  }

  /**
   * Calculates statistics for events.
   * @returns A promise that resolves to an object with total and upcoming event counts.
   */
  async getStats(): Promise<{ totalEvents: number; upcomingEvents: number }> {
    try {
      const totalEvents = await this.eventsRepository.count();
      const upcomingEvents = await this.eventsRepository.count({
        where: { date: MoreThan(new Date()) },
      });
      return { totalEvents, upcomingEvents };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve event statistics');
    }
  }

  /**
   * Registers a user for an event by incrementing the attendee count.
   * @param id - The ID of the event to register for.
   * @returns A promise that resolves to a success status and message.
   * @throws NotFoundException if the event is not found.
   * @throws BadRequestException if the event is full.
   */
  async register(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const event = await this.findOne(id);
      
      if (event.currentAttendees >= event.maxAttendees) {
        throw new BadRequestException('Event is full');
      }

      event.currentAttendees += 1;
      await this.eventsRepository.save(event);
      return { success: true, message: 'Registered successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Finds a single event by its ID.
   * @param id - The ID of the event.
   * @returns A promise that resolves to the event.
   * @throws NotFoundException if the event is not found.
   */
  async findOne(id: string): Promise<Event> {
    try {
      const event = await this.eventsRepository.findOneBy({ id });
      if (!event) {
        throw new NotFoundException(`Event with ID "${id}" not found`);
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve event');
    }
  }

  /**
   * Creates and saves a new event.
   * @param eventData - Partial event data for the new event.
   * @returns A promise that resolves to the saved event.
   */
  async create(eventData: Partial<Event>): Promise<Event> {
    try {
      if (!eventData.title) {
        throw new BadRequestException('Title is required for an event');
      }
      const event = this.eventsRepository.create(eventData);
      return await this.eventsRepository.save(event);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  /**
   * Updates an existing event by ID.
   * @param id - The ID of the event to update.
   * @param eventData - The updated data.
   * @returns A promise that resolves to the updated event.
   */
  async update(id: string, eventData: Partial<Event>): Promise<Event | null> {
    try {
      // Check if event exists
      await this.findOne(id);
      
      const { id: _, ...updateData } = eventData as any;
      await this.eventsRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to update event with ID "${id}"`);
    }
  }

  /**
   * Deletes an event by ID.
   * @param id - The ID of the event to delete.
   * @returns A promise that resolves when the delete operation is complete.
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.eventsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Event with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to delete event with ID "${id}"`);
    }
  }


  /**
   * Internal method to seed the database with initial event data.
   * @private
   */
  private async seedEvents() {

    const events = [
      {
        title: 'Advanced Jazz Piano Masterclass',
        description: 'Deep dive into jazz harmony, improvisation, and advanced voicings with celebrated jazz pianist Marcus Miller.',
        date: new Date('2026-04-15'),
        location: 'Sydney Conservatorium of Music',
        price: 150,
        category: 'masterclass',
        instrument: 'Piano',
        level: 'Advanced',
        maxAttendees: 20,
        currentAttendees: 15,
        status: 'upcoming',
        imageUrl: '/images/events/piano-masterclass.jpg',
      },
      {
        title: 'Vocal Performance Workshop',
        description: 'Learn breath control, stage presence, and microphone technique in this intensive one-day workshop.',
        date: new Date('2026-05-20'),
        location: 'Melbourne Recital Centre',
        price: 120,
        category: 'workshop',
        instrument: 'Voice',
        level: 'Intermediate',
        maxAttendees: 30,
        currentAttendees: 12,
        status: 'upcoming',
        imageUrl: '/images/events/vocal-workshop.jpg',
      },
      // Add more seed data as needed to match frontend samples
    ];

    for (const eventData of events) {
      const event = this.eventsRepository.create(eventData);
      await this.eventsRepository.save(event);
    }
    console.log('Seeded events data');
  }
}
