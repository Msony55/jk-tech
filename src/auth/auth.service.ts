import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import bcrypt from "bcrypt";
import { LoginDto, LogoutDto, RefreshTokenDto  } from './dto';
import { JwtTokenService } from '../core/jwt-token/jwt-token.service';
// import { HttpService } from '@nestjs/axios';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtTokenService: JwtTokenService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(
        { message: 'Email not found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        { message: 'Email Id and Password does not match' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const tokens = await this.jwtTokenService.getTokens(user.id, user.roles);

    await this.refreshTokenRepository.save({
      token: tokens.refresh_token,
      user_id: user.id,
    });

    return { ...tokens, user };
  }

  async useRefreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      await this.jwtTokenService.verifyJwt(refreshTokenDto.refresh_token);
    } catch (e) {
      throw new HttpException({ message: 'Refresh Token is Invalid' }, 469);
    }

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.refresh_token },
    });

    if (refreshToken == null) {
      throw new HttpException({ message: 'Refresh Token is Invalid' }, 469);
    }

    const user = await this.userRepository.findOne({
      where: { id: refreshToken.user_id },
    });
    
    if (user == null) {
      throw new HttpException({ message: 'User not found' }, 469);
    }

    const tokens = await this.jwtTokenService.getTokens(user.id, user.roles);

    await this.refreshTokenRepository.delete({ id: refreshToken.id });

    await this.refreshTokenRepository.save({
      token: tokens.refresh_token,
      user_id: user.id,
    });

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: user,
    };
  }

  async logout(userId, logoutDto: LogoutDto) {
    await this.refreshTokenRepository.delete({
      token: logoutDto.refresh_token,
      user_id: userId,
    });

    return {
      success: true,
      message: 'logged out successfully',
    };
  }
}
