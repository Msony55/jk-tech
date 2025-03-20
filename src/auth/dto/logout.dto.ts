import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'refresh token of the device logged in from',
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
