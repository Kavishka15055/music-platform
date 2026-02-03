/** 
 * gallery.controller.ts
 * Controller for managing gallery items.
 * @license might
 * @author KAVISHKA
*/
import { Controller, Get, Param, Query, Post, Body, Patch, Delete } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { Gallery } from './gallery.entity';

@Controller('v1/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  getAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.galleryService.findAll(page, limit);
  }

  @Get('featured')
  getFeatured() {
    return this.galleryService.findFeatured();
  }

  @Get('stats')
  getStats() {
    return this.galleryService.getStats();
  }

  @Get('category/:category')
  getByCategory(@Param('category') category: string) {
    return this.galleryService.findByCategory(category);
  }

  @Get('tag/:tag')
  getByTag(@Param('tag') tag: string) {
    return this.galleryService.findByTag(tag);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.galleryService.search(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Post()
  create(@Body() galleryData: any) {
    return this.galleryService.create(galleryData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() galleryData: any) {
    return this.galleryService.update(id, galleryData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
