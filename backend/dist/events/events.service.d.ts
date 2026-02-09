import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Event } from './event.entity';
export declare class EventsService implements OnModuleInit {
    private eventsRepository;
    private readonly i18n;
    constructor(eventsRepository: Repository<Event>, i18n: I18nService);
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
    findOne(id: string): Promise<Event>;
    create(eventData: Partial<Event>): Promise<Event>;
    update(id: string, eventData: Partial<Event>): Promise<Event | null>;
    remove(id: string): Promise<void>;
    private seedEvents;
}
