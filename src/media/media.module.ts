import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from 'src/media/entities/media.entity';
import { JwtTokenService } from 'src/core/jwt-token/jwt-token.service';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '../core/common/common.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Media]),
  ],
  controllers: [MediaController],
  providers: [MediaService,JwtTokenService, ConfigService, CommonService],
})
export class MediaModule {}
