import { Controller, Post, Body, Get, Param, Patch, Delete, UploadedFiles, UseInterceptors, Query, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';  // For multiple file upload
import { Roles } from 'src/core/common/custom.decorator';
import { UserRole } from 'src/user/enum/user.role';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('media')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files', maxCount: 10 }
  ]))
  async create(
    @UploadedFiles() files: { files: Express.Multer.File[] }, 
  ) {
    return this.mediaService.create(files);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files', maxCount: 1 }
  ]))
  update(@Param('id') id: string,  @UploadedFiles() files: { files: Express.Multer.File[] }) {
    return this.mediaService.update(id, files);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEW)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.mediaService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEW)
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
