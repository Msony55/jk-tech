import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtTokenService } from '../core/jwt-token/jwt-token.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto, RefreshTokenDto, LogoutDto } from './dto';
import { UserRole } from '../user/enum/user.role';

// Mock the necessary dependencies
const mockJwtTokenService = {
  getTokens: jest.fn(),
  verifyJwt: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockRefreshTokenRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<UserEntity>;
  let refreshTokenRepository: Repository<RefreshTokenEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    refreshTokenRepository = module.get<Repository<RefreshTokenEntity>>(getRepositoryToken(RefreshTokenEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw an error if email is not found', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new HttpException({ message: 'Email not found' }, HttpStatus.BAD_REQUEST),
      );
    });   
  });

  describe('useRefreshToken', () => {
    it('should throw an error if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'invalid_refresh_token' };
      mockJwtTokenService.verifyJwt.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.useRefreshToken(refreshTokenDto)).rejects.toThrow(
        new HttpException({ message: 'Refresh Token is Invalid' }, 469),
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'valid_refresh_token' };
      const refreshToken = { token: 'valid_refresh_token', user_id: '1' };
      const user = { id: '1', roles: ['user'] };
      const tokens = { access_token: 'new_access_token', refresh_token: 'new_refresh_token' };

      mockJwtTokenService.verifyJwt.mockResolvedValue(true);
      mockRefreshTokenRepository.findOne.mockResolvedValue(refreshToken);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtTokenService.getTokens.mockResolvedValue(tokens);
      mockRefreshTokenRepository.delete.mockResolvedValue({ affected: 1 });
      mockRefreshTokenRepository.save.mockResolvedValue({
        token: tokens.refresh_token,
        user_id: user.id,
      });

      const result = await authService.useRefreshToken(refreshTokenDto);
      expect(result).toEqual({ access_token: tokens.access_token, refresh_token: tokens.refresh_token, user });
      expect(mockJwtTokenService.getTokens).toHaveBeenCalledWith(user.id, user.roles);
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith({
        token: tokens.refresh_token,
        user_id: user.id,
      });
    });
  });

  describe('logout', () => {
    it('should remove the refresh token on logout', async () => {
      const logoutDto: LogoutDto = { refresh_token: 'some_refresh_token' };
      const userId = '1';
      mockRefreshTokenRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await authService.logout(userId, logoutDto);
      expect(result).toEqual({ success: true, message: 'logged out successfully' });
      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith({
        token: logoutDto.refresh_token,
        user_id: userId,
      });
    });
  });
});
