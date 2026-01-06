import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ================= SIGNUP =================
  @Post('signup')
  signup(@Body() body) {
    return this.authService.signup(body);
  }

  // ================= LOGIN =================
  @Post('login')
  login(@Body() body) {
    return this.authService.login(body);
  }

  // ================= VERIFY EMAIL =================
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ================= GOOGLE OAUTH =================
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Redirects user to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req, @Res() res) {
    const token = this.authService.generateJwt(req.user);

    return res.redirect(
      `https://pragra-frontend.vercel.app/oauth-success?token=${token}`,
    );
  }
}
