import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshTokenDto } from './dto';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn().mockReturnValue('some-config-value'), // Adjust the return value to fit your tests
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      useRefreshToken: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens when login is successful', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const token = { access_token: 'access_token', refresh_token: 'refresh_token' };

      authService.login = jest.fn().mockResolvedValue(token);

      const result = await authController.login(loginDto);

      expect(result).toEqual(token);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an error if login fails', async () => {
      const loginDto: LoginDto = { email: 'wrong@example.com', password: 'wrongpassword' };

      authService.login = jest.fn().mockRejectedValue(new HttpException('Invalid credentials', 400));

      await expect(authController.login(loginDto)).rejects.toThrow(HttpException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'valid_refresh_token' };
      const newTokens = { access_token: 'new_access_token', refresh_token: 'new_refresh_token' };

      authService.useRefreshToken = jest.fn().mockResolvedValue(newTokens);

      const result = await authController.token(refreshTokenDto);

      expect(result).toEqual(newTokens);
      expect(authService.useRefreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });

    it('should throw an error if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = { refresh_token: 'invalid_refresh_token' };

      authService.useRefreshToken = jest.fn().mockRejectedValue(new HttpException('Invalid refresh token', 400));

      await expect(authController.token(refreshTokenDto)).rejects.toThrow(HttpException);
      expect(authService.useRefreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    it('should return success message if logout is successful', async () => {
      const logoutDto: LogoutDto = { refresh_token: 'valid_refresh_token' };
      const userId = '1';
      const logoutResponse = { success: true, message: 'logged out successfully' };

      authService.logout = jest.fn().mockResolvedValue(logoutResponse);

      const result = await authController.logout(userId, logoutDto);

      expect(result).toEqual(logoutResponse);
      expect(authService.logout).toHaveBeenCalledWith(userId, logoutDto);
    });

    it('should throw an error if logout fails', async () => {
      const logoutDto: LogoutDto = { refresh_token: 'invalid_refresh_token' };
      const userId = '1';

      authService.logout = jest.fn().mockRejectedValue(new HttpException('Refresh token not found', 400));

      await expect(authController.logout(userId, logoutDto)).rejects.toThrow(HttpException);
      expect(authService.logout).toHaveBeenCalledWith(userId, logoutDto);
    });
  });
});
