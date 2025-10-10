import { CreatePostDto } from './create-post.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdatePostDTO extends PartialType(
  OmitType(CreatePostDto, ['authorId']),
) {}
