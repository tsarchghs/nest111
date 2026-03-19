import { Body, Controller, Get, Post } from '@nestjs/common';
import type { AuthSessionUser } from './access.types';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Get('me')
  me(@CurrentUser() user: AuthSessionUser) {
    return user;
  }
}
