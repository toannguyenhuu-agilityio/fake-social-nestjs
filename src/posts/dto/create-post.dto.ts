import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsNotEmpty()
  authorId: string;
}
