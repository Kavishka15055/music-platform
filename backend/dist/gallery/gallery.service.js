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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gallery_entity_1 = require("./gallery.entity");
let GalleryService = class GalleryService {
    galleryRepository;
    constructor(galleryRepository) {
        this.galleryRepository = galleryRepository;
    }
    async onModuleInit() {
        const count = await this.galleryRepository.count();
        if (count === 0) {
            this.seedData();
        }
    }
    async findAll(page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const [items, total] = await this.galleryRepository.findAndCount({
            take: limitNum,
            skip: (pageNum - 1) * limitNum,
            order: { createdAt: 'DESC' },
        });
        return { items, total };
    }
    findFeatured() {
        return this.galleryRepository.find({
            where: { featured: true },
            order: { createdAt: 'DESC' },
        });
    }
    findOne(id) {
        return this.galleryRepository.findOneBy({ id });
    }
    findByCategory(category) {
        return this.galleryRepository.find({
            where: { category },
            order: { createdAt: 'DESC' },
        });
    }
    findByTag(tag) {
        return this.galleryRepository.find({
            where: {
                tags: (0, typeorm_2.Like)(`%${tag}%`),
            },
            order: { createdAt: 'DESC' },
        });
    }
    search(query) {
        return this.galleryRepository.find({
            where: [
                { title: (0, typeorm_2.Like)(`%${query}%`) },
                { description: (0, typeorm_2.Like)(`%${query}%`) },
            ],
            order: { createdAt: 'DESC' },
        });
    }
    async getStats() {
        const total = await this.galleryRepository.count();
        const featured = await this.galleryRepository.count({ where: { featured: true } });
        const categoriesRaw = await this.galleryRepository
            .createQueryBuilder('gallery')
            .select('gallery.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .groupBy('gallery.category')
            .getRawMany();
        const categories = {};
        categoriesRaw.forEach(c => {
            categories[c.category] = parseInt(c.count);
        });
        const allTags = await this.galleryRepository
            .createQueryBuilder('gallery')
            .select('gallery.tags')
            .getMany();
        const uniqueTags = new Set();
        allTags.forEach(item => {
            if (Array.isArray(item.tags)) {
                item.tags.forEach(tag => uniqueTags.add(tag));
            }
        });
        return {
            total,
            featured,
            categories,
            tags: Array.from(uniqueTags)
        };
    }
    async create(galleryData) {
        const item = this.galleryRepository.create(galleryData);
        return this.galleryRepository.save(item);
    }
    async update(id, galleryData) {
        const { id: _, ...updateData } = galleryData;
        await this.galleryRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.galleryRepository.delete(id);
    }
    async seedData() {
        const initialData = [
            {
                title: 'Summer Music Festival 2025',
                description: 'Highlights from our annual summer concert featuring student performances across all instruments.',
                category: 'events',
                imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=1000',
                tags: ['concert', 'summer', 'students', 'live'],
                featured: true,
            },
            {
                title: 'Piano Masterclass',
                description: 'Guest lecture and demonstration by renowned pianist Dr. Elena Rodriguez.',
                category: 'events',
                imageUrl: 'https://images.unsplash.com/photo-1552422535-c4581dadc6f5?auto=format&fit=crop&q=80&w=1000',
                tags: ['piano', 'workshop', 'masterclass'],
                featured: true,
            },
            {
                title: 'Advanced Guitar Ensemble',
                description: 'Our senior guitar students performing classical pieces at the City Hall.',
                category: 'performances',
                imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1000',
                tags: ['guitar', 'ensemble', 'classical'],
                featured: false,
            },
            {
                title: 'Recording Studio A',
                description: 'State-of-the-art recording facility available for student projects.',
                category: 'studios',
                imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000',
                tags: ['studio', 'recording', 'technology'],
                featured: false,
            },
            {
                title: 'Violin Practice Room',
                description: 'Sound-proofed practice rooms designed for optimal acoustics.',
                category: 'studios',
                imageUrl: 'https://images.unsplash.com/photo-1519681393798-2fdd1f87aa50?auto=format&fit=crop&q=80&w=1000',
                tags: ['violin', 'practice', 'facility'],
                featured: false,
            },
            {
                title: 'Sarah Jenkins - Vocal Coach',
                description: 'Meet Sarah, our expert vocal coach specializing in jazz and contemporary styles.',
                category: 'teachers',
                imageUrl: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=1000',
                tags: ['teacher', 'vocals', 'jazz'],
                featured: true,
            },
            {
                title: 'Vintage Gibson Les Paul',
                description: 'One of the many collaborative instruments available for advanced students.',
                category: 'instruments',
                imageUrl: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&q=80&w=1000',
                tags: ['guitar', 'vintage', 'equipment'],
                featured: false,
            },
            {
                title: 'Drum Workshop',
                description: 'Rhythm basics workshop for beginners.',
                category: 'events',
                imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb4747?auto=format&fit=crop&q=80&w=1000',
                tags: ['drums', 'workshop', 'beginners'],
                featured: false,
            },
        ];
        for (const item of initialData) {
            await this.galleryRepository.save(this.galleryRepository.create(item));
        }
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gallery_entity_1.Gallery)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map