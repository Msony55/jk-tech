import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseFilters,
  Headers,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../core/http-exception.filter';
import { Roles } from '../core/common/custom.decorator';
import { UserRole } from './enum/user.role';
import { AuthGuard } from '../core/guards/auth.guard';

@Controller('user')
@ApiTags('User')
@UseFilters(HttpExceptionFilter)
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles(UserRole.ADMIN)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/create')
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserFromId(id);
    if (user == null) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete('delete')
  deleteAccount(@Headers('userId') userId) {
    const a = this.userService.deleteAccount(userId);
    return a;
  }
}
