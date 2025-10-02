import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a comment on the post',
    description: 'The content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'c4b9f5c1-29b1-4db8-9a13-8e3e5d725c92',
    description: 'The ID of the post this comment belongs to',
  })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiProperty({
    example: 'toan.nguyenhuu@asnet.com.vn',
    description: 'The ID of the user (author) who wrote the comment',
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
