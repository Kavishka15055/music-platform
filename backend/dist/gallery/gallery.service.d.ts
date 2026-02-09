import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Gallery } from './gallery.entity';
export declare class GalleryService implements OnModuleInit {
    private galleryRepository;
    private readonly i18n;
    constructor(galleryRepository: Repository<Gallery>, i18n: I18nService);
    onModuleInit(): Promise<void>;
    findAll(page?: number, limit?: number): Promise<{
        items: Gallery[];
        total: number;
    }>;
    findFeatured(): Promise<Gallery[]>;
    findOne(id: string): Promise<Gallery>;
    findByCategory(category: string): Promise<Gallery[]>;
    findByTag(tag: string): Promise<Gallery[]>;
    search(query: string): Promise<Gallery[]>;
    getStats(): Promise<{
        total: number;
        featured: number;
        categories: {};
        tags: string[];
    }>;
    create(galleryData: Partial<Gallery>): Promise<Gallery>;
    update(id: string, galleryData: Partial<Gallery>): Promise<Gallery | null>;
    remove(id: string): Promise<void>;
    private seedData;
}
