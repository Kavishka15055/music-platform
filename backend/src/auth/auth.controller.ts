import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/student')
  registerStudent(
    @Body()
    dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
  ) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/teacher')
  registerTeacher(
    @Body()
    dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      qualifications: string;
      teachingExperience: string;
      bio?: string;
    },
  ) {
    return this.authService.registerTeacher(dto);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    const { password, ...user } = req.user;
    return user;
  }
}
