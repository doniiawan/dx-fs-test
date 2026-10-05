import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum, IsOptional, MinLength, ValidateIf } from 'class-validator';
import { Role } from '../../entities/user.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'karyawan@dexa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Frontend Engineer' })
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: '081299998888' })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({ enum: Role, default: Role.EMPLOYEE })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'budi@dexa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  @ValidateIf((o) => typeof o.password === 'string' && o.password.length > 0)
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Lead Frontend Engineer' })
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ example: '081299998888' })
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}