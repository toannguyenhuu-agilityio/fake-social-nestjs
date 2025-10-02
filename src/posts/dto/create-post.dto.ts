import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My first post', description: 'Title of the post' })
  @IsNotEmpty()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is my first post',
    description: 'Content of the post',
  })
  @IsNotEmpty()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'toan.nguyenhuu@asnet.com.vn',
    description: 'Uniqe email of the user',
  })
  @IsNotEmpty()
  @IsNotEmpty()
  authorId: string;
}
