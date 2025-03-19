import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtTokenService } from '../core/jwt-token/jwt-token.service';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    private jwtTokenService: JwtTokenService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.save(dto);
    const tokens = await this.jwtTokenService.getTokens(user.id, user.roles);

    await this.refreshTokenRepository.save({
      token: tokens.refresh_token,
      user_id: user.id,
    });

    return { user, ...tokens };
  }

  async getUserFromId(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.save({
      id: id,
      ...updateUserDto,
    });
    return this.userRepository.findOne({ where: { id: id } });
  }

  async deleteAccount(userId) {
    await this.refreshTokenRepository.delete({
      user_id: userId,
    });

    await this.userRepository.update({ id: userId }, { is_deleted: true });

    return {
      success: true,
      message: 'Your Account is deleted successfully',
    };
  }

  //admin
  // async getAllUsers(pageNo: number, limit: number) {
  //   const paginate = createPaginator({ perPage: limit || 10 });
  //   const users = await paginate<user, Prisma.userFindManyArgs>(
  //     this.prisma.user,
  //     {
  //       orderBy: {
  //         id: 'desc',
  //       },
  //     },
  //     { page: pageNo },
  //   );
  //
  //   return users;
  // }
}
