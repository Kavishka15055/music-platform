/**
 * File: gallery.module.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Module definition for organization and dependency injection of gallery-related components.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Gallery } from './gallery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery])],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
