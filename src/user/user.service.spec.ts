import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtTokenService } from '../core/jwt-token/jwt-token.service';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enum/user.role';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let refreshTokenRepository: Repository<RefreshTokenEntity>;
  let jwtTokenService: JwtTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: JwtTokenService,
          useValue: {
            getTokens: jest.fn().mockResolvedValue({
              access_token: 'access_token',
              refresh_token: 'refresh_token',
            }),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    refreshTokenRepository = module.get<Repository<RefreshTokenEntity>>(getRepositoryToken(RefreshTokenEntity));
    jwtTokenService = module.get<JwtTokenService>(JwtTokenService);
  });

  const createUserDto: CreateUserDto = { 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    roles: [UserRole.ADMIN],
    password: 'somepassword'
  };

  const commonData = {
    created_at: new Date(),
    updated_at: new Date(),
    updated_by: '1',
  };

  const user = { 
    ...createUserDto,
    id: '1',
    email_confirmed_at: new Date(),
    is_active: true,
    is_deleted: false,
    ...commonData,
  };

  const tokens = {
    access_token: 'access_token',
    refresh_token: 'refresh_token',
  };

  const refreshTokenMock = {
      id: BigInt("9007199254740991"),
      token: tokens.refresh_token,
      user_id: user.id,
      valid_till: new Date(),
      revoked: false,
      user,
      ...commonData,
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should successfully create a user and return user with tokens', async () => {
    
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(refreshTokenRepository, 'save').mockResolvedValue(refreshTokenMock);
    
      const result = await service.createUser(createUserDto);
    
      expect(result.user).toEqual(user);
      expect(result.access_token).toBe(tokens.access_token);
      expect(result.refresh_token).toBe(tokens.refresh_token);
    });
    

    it('should throw error when user creation fails', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValue(new Error('Error creating user'));

      await expect(service.createUser(createUserDto)).rejects.toThrow('Error creating user');
    });
  });

  describe('getUserFromId', () => {
    it('should return a user when found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.getUserFromId('1');
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserFromId('1');
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        roles: [],
        password: ''
      };

      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.updateUser('1', updateUserDto);
      expect(result).toEqual(user);
    });

    it('should throw error if user update fails', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValue(new Error('Error updating user'));

      await expect(service.updateUser('1', user)).rejects.toThrow('Error updating user');
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete the account', async () => {
      jest.spyOn(refreshTokenRepository, 'delete').mockResolvedValue({ affected: 1, raw: [] });
      jest.spyOn(userRepository, 'update').mockResolvedValue({affected: 1, raw: [], generatedMaps: [] });

      const result = await service.deleteAccount('1');
      expect(result).toEqual({ success: true, message: 'Your Account is deleted successfully' });
    });

    it('should throw error when deleting account fails', async () => {
      jest.spyOn(refreshTokenRepository, 'delete').mockRejectedValue(new Error('Error deleting refresh token'));
      jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Error deleting user account'));

      await expect(service.deleteAccount('1')).rejects.toThrow('Error deleting refresh token');
    });
  });
});
