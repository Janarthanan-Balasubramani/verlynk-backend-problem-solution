import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  /**
   *@function :Login
   *
   * @description : allows users to login in the application
   *
   * @param type(createAuthDto) email and password in body
   * @returns
   *  user details with token
   */
  Login(@Body() createAuthDto: AuthDto) {
    return this.authService.Login(createAuthDto);
  }
}
