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

  /**
   * Retrieves all gallery items with optional pagination.
   * @param page - The page number to retrieve.
   * @param limit - The number of items per page.
   * @returns A list of gallery items and pagination metadata.
   */
  @Get()
  getAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.galleryService.findAll(page, limit);
  }

  /**
   * Retrieves all featured gallery items.
   * @returns A list of featured gallery items.
   */
  @Get('featured')
  getFeatured() {
    return this.galleryService.findFeatured();
  }

  /**
   * Retrieves statistics for the gallery.
   * @returns Statistics such as total items, categories, etc.
   */
  @Get('stats')
  getStats() {
    return this.galleryService.getStats();
  }

  /**
   * Retrieves gallery items by category.
   * @param category - The category to filter by.
   * @returns A list of gallery items in the specified category.
   */
  @Get('category/:category')
  getByCategory(@Param('category') category: string) {
    return this.galleryService.findByCategory(category);
  }

  /**
   * Retrieves gallery items by tag.
   * @param tag - The tag to filter by.
   * @returns A list of gallery items with the specified tag.
   */
  @Get('tag/:tag')
  getByTag(@Param('tag') tag: string) {
    return this.galleryService.findByTag(tag);
  }

  /**
   * Searches for gallery items based on a query string.
   * @param query - The search query.
   * @returns A list of gallery items matching the query.
   */
  @Get('search')
  search(@Query('q') query: string) {
    return this.galleryService.search(query);
  }

  /**
   * Retrieves a single gallery item by ID.
   * @param id - The ID of the gallery item.
   * @returns The gallery item if found.
   */
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  /**
   * Creates a new gallery item.
   * @param galleryData - The data for the new gallery item.
   * @returns The created gallery item.
   */
  @Post()
  create(@Body() galleryData: any) {
    return this.galleryService.create(galleryData);
  }

  /**
   * Updates an existing gallery item by ID.
   * @param id - The ID of the gallery item to update.
   * @param galleryData - The updated data.
   * @returns The updated gallery item.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() galleryData: any) {
    return this.galleryService.update(id, galleryData);
  }

  /**
   * Deletes a gallery item by ID.
   * @param id - The ID of the gallery item to delete.
   * @returns A confirmation message or the deleted item.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

}
