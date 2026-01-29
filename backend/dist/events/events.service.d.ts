import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
export declare class EventsService implements OnModuleInit {
    private eventsRepository;
    constructor(eventsRepository: Repository<Event>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<Event[]>;
    findUpcoming(): Promise<Event[]>;
    getStats(): Promise<{
        totalEvents: number;
        upcomingEvents: number;
    }>;
    register(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<Event | null>;
    create(eventData: Partial<Event>): Promise<Event>;
    update(id: string, eventData: Partial<Event>): Promise<Event | null>;
    remove(id: string): Promise<void>;
    private seedEvents;
}
