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
const nestjs_i18n_1 = require("nestjs-i18n");
const event_entity_1 = require("./event.entity");
let EventsService = class EventsService {
    eventsRepository;
    i18n;
    constructor(eventsRepository, i18n) {
        this.eventsRepository = eventsRepository;
        this.i18n = i18n;
    }
    async onModuleInit() {
        try {
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
        catch (error) {
            console.error('Error during events module initialization:', error);
        }
    }
    async findAll() {
        try {
            return await this.eventsRepository.find({ order: { date: 'ASC' } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve events');
        }
    }
    async findUpcoming() {
        try {
            return await this.eventsRepository.find({
                where: { date: (0, typeorm_2.MoreThan)(new Date()) },
                order: { date: 'ASC' },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve upcoming events');
        }
    }
    async getStats() {
        try {
            const totalEvents = await this.eventsRepository.count();
            const upcomingEvents = await this.eventsRepository.count({
                where: { date: (0, typeorm_2.MoreThan)(new Date()) },
            });
            return { totalEvents, upcomingEvents };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve event statistics');
        }
    }
    async register(id) {
        try {
            const event = await this.findOne(id);
            if (event.currentAttendees >= event.maxAttendees) {
                throw new common_1.BadRequestException('Event is full');
            }
            event.currentAttendees += 1;
            await this.eventsRepository.save(event);
            return {
                success: true,
                message: this.i18n.t('common.events.CREATED', { lang: nestjs_i18n_1.I18nContext.current()?.lang || 'en' })
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Registration failed');
        }
    }
    async findOne(id) {
        try {
            const event = await this.eventsRepository.findOneBy({ id });
            if (!event) {
                throw new common_1.NotFoundException(this.i18n.t('common.events.NOT_FOUND', { lang: nestjs_i18n_1.I18nContext.current()?.lang || 'en' }));
            }
            return event;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to retrieve event');
        }
    }
    async create(eventData) {
        try {
            if (!eventData.title) {
                throw new common_1.BadRequestException('Title is required for an event');
            }
            const event = this.eventsRepository.create(eventData);
            return await this.eventsRepository.save(event);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to create event');
        }
    }
    async update(id, eventData) {
        try {
            await this.findOne(id);
            const { id: _, ...updateData } = eventData;
            await this.eventsRepository.update(id, updateData);
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(`Failed to update event with ID "${id}"`);
        }
    }
    async remove(id) {
        try {
            const result = await this.eventsRepository.delete(id);
            if (result.affected === 0) {
                throw new common_1.NotFoundException(`Event with ID "${id}" not found`);
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException(`Failed to delete event with ID "${id}"`);
        }
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        nestjs_i18n_1.I18nService])
], EventsService);
//# sourceMappingURL=events.service.js.map