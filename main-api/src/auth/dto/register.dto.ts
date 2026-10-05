import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@dexa.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Job position' })
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: '08123456789', description: 'Phone number' })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ enum: Role, default: Role.EMPLOYEE, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}