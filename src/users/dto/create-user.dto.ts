import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'toan.nguyenhuu@asnet.com.vn',
    description: 'Uniqe email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Toan', description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Nguyen', description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password (min 6 chars)',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
