"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./event.entity");
let EventsService = class EventsService {
    eventsRepository;
    constructor(eventsRepository) {
        this.eventsRepository = eventsRepository;
    }
    async onModuleInit() {
        const count = await this.eventsRepository.count();
        if (count === 0) {
            await this.seedEvents();
        }
        else {
            const events = await this.eventsRepository.find();
            const now = new Date();
            let updated = false;
            for (const event of events) {
                if (new Date(event.date) < now) {
                    const newDate = new Date(event.date);
                    newDate.setFullYear(2026);
                    event.date = newDate;
                    await this.eventsRepository.save(event);
                    updated = true;
                }
            }
            if (updated)
                console.log('Updated past events to 2026');
        }
    }
    async findAll() {
        return this.eventsRepository.find({ order: { date: 'ASC' } });
    }
    async findUpcoming() {
        return this.eventsRepository.find({
            where: { date: (0, typeorm_2.MoreThan)(new Date()) },
            order: { date: 'ASC' },
        });
    }
    async getStats() {
        const totalEvents = await this.eventsRepository.count();
        const upcomingEvents = await this.eventsRepository.count({
            where: { date: (0, typeorm_2.MoreThan)(new Date()) },
        });
        return { totalEvents, upcomingEvents };
    }
    async register(id) {
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
    async findOne(id) {
        return this.eventsRepository.findOneBy({ id });
    }
    async create(eventData) {
        const event = this.eventsRepository.create(eventData);
        return this.eventsRepository.save(event);
    }
    async update(id, eventData) {
        const { id: _, ...updateData } = eventData;
        await this.eventsRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.eventsRepository.delete(id);
    }
    async seedEvents() {
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
        ];
        for (const eventData of events) {
            const event = this.eventsRepository.create(eventData);
            await this.eventsRepository.save(event);
        }
        console.log('Seeded events data');
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map