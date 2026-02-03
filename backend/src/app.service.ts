/**
 * File: app.service.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Main application service providing basic business logic.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
