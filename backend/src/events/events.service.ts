import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async onModuleInit() {
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
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({ order: { date: 'ASC' } });
  }

  async findUpcoming(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { date: MoreThan(new Date()) },
      order: { date: 'ASC' },
    });
  }

  async getStats(): Promise<{ totalEvents: number; upcomingEvents: number }> {
    const totalEvents = await this.eventsRepository.count();
    const upcomingEvents = await this.eventsRepository.count({
      where: { date: MoreThan(new Date()) },
    });
    return { totalEvents, upcomingEvents };
  }

  async register(id: string): Promise<{ success: boolean; message: string }> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    if (event.currentAttendees >= event.maxAttendees) {
      return { success: false, message: 'Event is full' };
    }

    event.currentAttendees += 1;
    await this.eventsRepository.save(event);
    return { success: true, message: 'Registered successfully' };
  }

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
