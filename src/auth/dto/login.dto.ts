import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
      description: 'email of the user',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
  
    @ApiProperty({
      description: 'password of the user',
    })
    @IsNotEmpty()
    @IsString()
    password: string;
  }