import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({
    example: 'b2d3a540-8b47-4af9-9d2d-8b6b0a1f40b1',
    description: 'Unique identifier of the user (UUID)',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'toan.nguyenhuu@asnet.com.vn',
    description: 'User email address',
  })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Toan',
    description: 'First name of the user',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    example: 'Nguyen',
    description: 'Last name of the user',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password (min 6 chars)',
  })
  @Expose()
  @Exclude()
  password: string;

  @ApiProperty({
    example: '2025-10-06T10:30:00.000Z',
    description: 'Date when the user was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-06T11:00:00.000Z',
    description: 'Date when the user was last updated',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
