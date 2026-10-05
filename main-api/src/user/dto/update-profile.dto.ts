import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsPhoneNumber, IsUrl, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Donny Kurniawan', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Senior Backend Engineer', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: '081234567890', required: false })
  @IsOptional()
  @IsPhoneNumber('ID')
  phoneNumber?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ example: 'password12345', required: false })
  @IsOptional()
  @MinLength(6)
  password?: string;
}