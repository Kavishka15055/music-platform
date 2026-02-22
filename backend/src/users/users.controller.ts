import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Public: list approved teachers */
  @Get('teachers')
  getApprovedTeachers() {
    return this.usersService.getApprovedTeachers();
  }

  /** Public: get teacher profile by id */
  @Get('teachers/:id')
  getTeacherById(@Param('id') id: string) {
    return this.usersService.getTeacherById(id);
  }

  /** Admin only: list pending teachers */
  @Get('pending-teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingTeachers() {
    return this.usersService.getPendingTeachers();
  }

  /** Admin only: count pending teachers */
  @Get('pending-teachers/count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  countPendingTeachers() {
    return this.usersService.countPendingTeachers();
  }

  /** Admin only: approve teacher */
  @Post('teachers/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approveTeacher(@Param('id') id: string) {
    return this.usersService.approveTeacher(id);
  }

  /** Admin only: reject teacher */
  @Post('teachers/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectTeacher(@Param('id') id: string) {
    return this.usersService.rejectTeacher(id);
  }

  /** Auth: get current user profile */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }
}
