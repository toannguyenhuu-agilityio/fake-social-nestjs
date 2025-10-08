import { ApiProperty } from '@nestjs/swagger';

export class CommentEntity {
  @ApiProperty({
    example: 'c4b9f5c1-29b1-4db8-9a13-8e3e5d725c92',
    description: 'Unique identifier of the comment (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'This is a comment on the post',
    description: 'The content of the comment',
  })
  content: string;

  @ApiProperty({
    example: 'toan.nguyenhuu@asnet.com.vn',
    description: 'The ID of the user (author) who wrote the comment',
  })
  authorId: string;

  @ApiProperty({
    example: 'c4b9f5c1-29b1-4db8-9a13-8e3e5d725c92',
    description: 'The ID of the post this comment belongs to',
  })
  postId: string;

  @ApiProperty({
    example: '2025-08-05T12:34:56.789Z',
    description: 'The date and time the comment was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-05T12:34:56.789Z',
    description: 'The date and time the comment was last updated',
  })
  updatedAt: Date;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
