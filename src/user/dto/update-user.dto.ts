import { IsNotEmpty, IsString, IsEmail, IsArray, IsEnum, ArrayMinSize, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user.role';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'Mohit Soni',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The roles assigned to the user',
    example: ['ADMIN', 'EDITOR', 'VIEW'],
    required: true,
  })
  @IsArray() 
  @ArrayMinSize(1, { message: 'At least one role must be provided' }) 
  @IsEnum(UserRole, { each: true }) 
  roles: UserRole[];

  @ApiProperty({
    description: 'The password of the user',
    example: 'Mohit@123',
    required: true,
  })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must be at least 8 characters long, contain at least one letter, one number, and one special character',
  })
  password: string;
}