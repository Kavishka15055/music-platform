import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Gallery } from './gallery.entity';
export declare class GalleryService implements OnModuleInit {
    private galleryRepository;
    constructor(galleryRepository: Repository<Gallery>);
    onModuleInit(): Promise<void>;
    findAll(page?: number, limit?: number): Promise<{
        items: Gallery[];
        total: number;
    }>;
    findFeatured(): Promise<Gallery[]>;
    findOne(id: string): Promise<Gallery | null>;
    findByCategory(category: string): Promise<Gallery[]>;
    findByTag(tag: string): Promise<Gallery[]>;
    search(query: string): Promise<Gallery[]>;
    getStats(): Promise<{
        total: number;
        featured: number;
        categories: {};
        tags: string[];
    }>;
    private seedData;
}
