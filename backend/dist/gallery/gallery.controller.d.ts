import { GalleryService } from './gallery.service';
import { Gallery } from './gallery.entity';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    getAll(page?: number, limit?: number): Promise<{
        items: Gallery[];
        total: number;
    }>;
    getFeatured(): Promise<Gallery[]>;
    getStats(): Promise<{
        total: number;
        featured: number;
        categories: {};
        tags: string[];
    }>;
    getByCategory(category: string): Promise<Gallery[]>;
    getByTag(tag: string): Promise<Gallery[]>;
    search(query: string): Promise<Gallery[]>;
    getById(id: string): Promise<Gallery>;
    create(galleryData: any): Promise<Gallery>;
    update(id: string, galleryData: any): Promise<Gallery | null>;
    remove(id: string): Promise<void>;
}
