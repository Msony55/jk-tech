import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException } from '@nestjs/common';
import { UserRole } from './enum/user.role';
import { AuthGuard } from '../core/guards/auth.guard';
import { ConfigService } from '@nestjs/config';

const mockUserService = {
  createUser: jest.fn(),
  getUserFromId: jest.fn(),
  updateUser: jest.fn(),
  deleteAccount: jest.fn(),
};

// Mock the ConfigService, which is a dependency of AuthGuard
const mockConfigService = {
  get: jest.fn().mockReturnValue('some-config-value'), // Adjust the return value to fit your tests
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthGuard,
          useValue: jest.fn(() => true),
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  const dto: CreateUserDto = { name: 'John Doe', email: 'john.doe@example.com', roles: [UserRole.ADMIN], password: 'somepassword' };

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      mockUserService.createUser.mockResolvedValue(dto);

      expect(await userController.createUser(dto)).toEqual(dto);
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if user creation fails', async () => {
      mockUserService.createUser.mockRejectedValue(new HttpException('Internal Server Error', 500));

      await expect(userController.createUser(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const userId = '123';
      const user = { id: userId, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserService.getUserFromId.mockResolvedValue(user);

      expect(await userController.getUser(userId)).toEqual(user);
      expect(mockUserService.getUserFromId).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user is not found', async () => {
      const userId = '123';
      mockUserService.getUserFromId.mockResolvedValue(null);

      await expect(userController.getUser(userId)).rejects.toThrow(
        new HttpException('user not found', 404),
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = '123';
      mockUserService.updateUser.mockResolvedValue({ ...dto, id: userId });

      expect(await userController.updateUser(userId, dto)).toEqual({ ...dto, id: userId });
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete a user account successfully', async () => {
      const userId =  '123';
      mockUserService.deleteAccount.mockResolvedValue('Account deleted successfully');

      expect(await userController.deleteAccount({ userId })).toEqual('Account deleted successfully');
      expect(mockUserService.deleteAccount).toHaveBeenCalledWith({userId});
    });

    it('should throw an error if account deletion fails', async () => {
      const userId = '123';
      mockUserService.deleteAccount.mockRejectedValue(new HttpException('Internal Server Error', 500));

      await expect(userController.deleteAccount({ userId })).rejects.toThrow(HttpException);
    });
  });
});
