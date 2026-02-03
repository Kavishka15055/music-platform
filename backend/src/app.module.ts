/**
 * File: app.module.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Root module of the application. Configures environment variables,
 *   database connection, and imports feature modules.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { Event } from './events/event.entity';
import { GalleryModule } from './gallery/gallery.module';
import { Gallery } from './gallery/gallery.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [Event, Gallery],
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),
    EventsModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
