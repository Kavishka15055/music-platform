/**
 * File: app.controller.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Main application controller handling basic root-level routes.
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
