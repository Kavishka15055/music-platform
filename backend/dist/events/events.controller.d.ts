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
    register(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
