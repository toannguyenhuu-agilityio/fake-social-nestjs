import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class UserEntity {
  @Expose()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
