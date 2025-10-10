import { ApiProperty } from '@nestjs/swagger';

export class PostEntity {
  @ApiProperty({
    example: 'b5d7f64a-2e0a-4d69-ae19-7e3e911ce8f2',
    description: 'Unique identifier of the post (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'My first post',
    description: 'Title of the post',
  })
  title: string;

  @ApiProperty({
    example: 'This is my first post',
    description: 'Content of the post',
  })
  content: string;

  @ApiProperty({
    example: 'b2d3a540-8b47-4af9-9d2d-8b6b0a1f40b1',
    description: 'The ID of the user (author) who wrote the post',
  })
  authorId: string;

  @ApiProperty({
    example: '2025-08-05T12:34:56.789Z',
    description: 'The date and time the post was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-05T12:34:56.789Z',
    description: 'The date and time the post was last updated',
  })
  updatedAt: Date;

  constructor(partial: Partial<PostEntity>) {
    Object.assign(this, partial);
  }
}
