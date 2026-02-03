
/**
 * File: gallery.service.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Service providing business logic for gallery management and data seeding.
 */
import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ArrayContains } from 'typeorm';
import { Gallery } from './gallery.entity';

@Injectable()
export class GalleryService implements OnModuleInit {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

  /**
   * Lifecycle hook that runs when the module is initialized.
   * Seeds initial gallery data if the repository is empty.
   */
  async onModuleInit() {
    try {
      // Seed data if empty
      const count = await this.galleryRepository.count();
      if (count === 0) {
        await this.seedData();
      }
    } catch (error) {
      console.error('Error during gallery module initialization:', error);
    }
  }

  /**
   * Retrieves all gallery items with pagination.
   * @param page - The page number (defaults to 1).
   * @param limit - The number of items per page (defaults to 20).
   * @returns An object containing the list of items and total count.
   */
  async findAll(page: number = 1, limit: number = 20) {
    try {
      // Ensure page and limit are numbers, even if passed as strings
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 20;
      
      const [items, total] = await this.galleryRepository.findAndCount({
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        order: { createdAt: 'DESC' },
      });
      return { items, total };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve gallery items');
    }
  }

  /**
   * Finds all gallery items marked as featured.
   * @returns A list of featured gallery items.
   */
  async findFeatured() {
    try {
      return await this.galleryRepository.find({
        where: { featured: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve featured gallery items');
    }
  }

  /**
   * Finds a single gallery item by its ID.
   * @param id - The ID of the item.
   * @returns The gallery item.
   * @throws NotFoundException if the item is not found.
   */
  async findOne(id: string) {
    try {
      const item = await this.galleryRepository.findOneBy({ id });
      if (!item) {
        throw new NotFoundException(`Gallery item with ID "${id}" not found`);
      }
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve gallery item');
    }
  }

  /**
   * Finds gallery items that belong to a specific category.
   * @param category - The category name.
   * @returns A list of gallery items in that category.
   */
  async findByCategory(category: string) {
    try {
      return await this.galleryRepository.find({
        where: { category },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to retrieve items for category "${category}"`);
    }
  }

  /**
   * Finds gallery items that contain a specific tag.
   * @param tag - The tag to search for.
   * @returns A list of items matching the tag.
   */
  async findByTag(tag: string) {
    try {
      return await this.galleryRepository.find({
        where: {
          tags: Like(`%${tag}%`),
        },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to retrieve items for tag "${tag}"`);
    }
  }

  /**
   * Searches for gallery items by title or description.
   * @param query - The search string.
   * @returns A list of items matching the query.
   */
  async search(query: string) {
    try {
      return await this.galleryRepository.find({
        where: [
          { title: Like(`%${query}%`) },
          { description: Like(`%${query}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Search failed for query "${query}"`);
    }
  }

  /**
   * Gets statistics about the gallery, including counts per category and unique tags.
   * @returns An object with gallery statistics.
   */
  async getStats() {
    try {
      const total = await this.galleryRepository.count();
      const featured = await this.galleryRepository.count({ where: { featured: true } });
      
      // Get all categories distinct
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

      // Get all unique tags
      const allTags = await this.galleryRepository
        .createQueryBuilder('gallery')
        .select('gallery.tags')
        .getMany();
      
      const uniqueTags = new Set<string>();
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve gallery statistics');
    }
  }

  /**
   * Creates a new gallery item.
   * @param galleryData - The data for the new item.
   * @returns The saved gallery item.
   */
  async create(galleryData: Partial<Gallery>): Promise<Gallery> {
    try {
      if (!galleryData.title) {
        throw new BadRequestException('Title is required for a gallery item');
      }
      const item = this.galleryRepository.create(galleryData);
      return await this.galleryRepository.save(item);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create gallery item');
    }
  }

  /**
   * Updates an existing gallery item by ID.
   * @param id - The item ID.
   * @param galleryData - The updated data.
   * @returns The updated gallery item.
   */
  async update(id: string, galleryData: Partial<Gallery>): Promise<Gallery | null> {
    try {
      // Check if item exists
      await this.findOne(id);
      
      const { id: _, ...updateData } = galleryData as any;
      await this.galleryRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to update gallery item with ID "${id}"`);
    }
  }

  /**
   * Removes a gallery item by ID.
   * @param id - The item ID.
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.galleryRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Gallery item with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Failed to delete gallery item with ID "${id}"`);
    }
  }


  /**
   * Internal method to seed the database with initial gallery data.
   * @private
   */
  private async seedData() {

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
}
