import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePostDTO extends PartialType(
  OmitType(CreatePostDto, ['authorId']),
) {}
