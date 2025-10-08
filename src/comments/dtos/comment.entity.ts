import { ApiProperty } from '@nestjs/swagger';

export class CommentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  postId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
