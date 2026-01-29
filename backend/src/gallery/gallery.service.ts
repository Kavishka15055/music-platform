import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ArrayContains } from 'typeorm';
import { Gallery } from './gallery.entity';

@Injectable()
export class GalleryService implements OnModuleInit {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

  async onModuleInit() {
    // Seed data if empty
    const count = await this.galleryRepository.count();
    if (count === 0) {
      this.seedData();
    }
  }

  async findAll(page: number = 1, limit: number = 20) {
    // Ensure page and limit are numbers, even if passed as strings
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

  findOne(id: string) {
    return this.galleryRepository.findOneBy({ id });
  }

  findByCategory(category: string) {
    return this.galleryRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  findByTag(tag: string) {
    return this.galleryRepository.find({
      where: {
        tags: Like(`%${tag}%`),
      },
      order: { createdAt: 'DESC' },
    });
  }

  search(query: string) {
    return this.galleryRepository.find({
      where: [
        { title: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
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
    // This is a bit heavier, might need optimization for large datasets
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
  }

  async create(galleryData: Partial<Gallery>): Promise<Gallery> {
    const item = this.galleryRepository.create(galleryData);
    return this.galleryRepository.save(item);
  }

  async update(id: string, galleryData: Partial<Gallery>): Promise<Gallery | null> {
    const { id: _, ...updateData } = galleryData as any;
    await this.galleryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.galleryRepository.delete(id);
  }

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
