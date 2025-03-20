import { Body, Controller, Post, Headers, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../core/http-exception.filter';
import { Roles } from '../core/common/custom.decorator';
import { UserRole } from '../user/enum/user.role';
import { LoginDto, LogoutDto, RefreshTokenDto   } from './dto';
import { AuthGuard } from '../core/guards/auth.guard';

@Controller('auth')
@ApiTags('Auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    const token = this.authService.login(loginDto);
    return token;
  }

  @ApiBody({ type: RefreshTokenDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('refresh')
  token(@Body() refreshToken: RefreshTokenDto) {
    const a = this.authService.useRefreshToken(refreshToken);
    return a;
  }

  @ApiBody({ type: LogoutDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(UserRole.VIEW, UserRole.EDITOR, UserRole.ADMIN)
  @Post('logout')
  logout(@Headers('userId') userId, @Body() logoutDto: LogoutDto) {
    const a = this.authService.logout(userId, logoutDto);
    return a;
  }
}
