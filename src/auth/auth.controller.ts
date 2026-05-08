import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('exists')
  async checkExists() {
    const exists = await this.authService.checkAdminExists();
    return { exists };
  }

  @Post('bootstrap')
  bootstrap(@Body() body: { email: string; password: string }) {
    return this.authService.bootstrapAdmin(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Patch('credentials')
  @UseGuards(AdminAuthGuard)
  updateCredentials(
    @Req() req: { admin: { sub: number } },
    @Body() body: { email: string; password: string },
  ) {
    return this.authService.updateCredentials(req.admin.sub, body);
  }
}
