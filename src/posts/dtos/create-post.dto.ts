import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My first post', description: 'Title of the post' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is my first post',
    description: 'Content of the post',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'b5d7f64a-2e0a-4d69-ae19-7e3e911ce8f2',
    description: 'The ID of the user (author) who wrote the post',
  })
  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
