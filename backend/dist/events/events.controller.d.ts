import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(): Promise<import("./event.entity").Event[]>;
    findUpcoming(): Promise<import("./event.entity").Event[]>;
    getStats(): Promise<{
        totalEvents: number;
        upcomingEvents: number;
    }>;
    findOne(id: string): Promise<import("./event.entity").Event>;
    create(eventData: any): Promise<import("./event.entity").Event>;
    update(id: string, eventData: any): Promise<import("./event.entity").Event | null>;
    remove(id: string): Promise<void>;
    register(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
