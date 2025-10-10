import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Current page number (default: 1)',
  })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page (default: 10)',
  })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to order by (default: createdAt)',
  })
  @IsOptional()
  @Type(() => String)
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort direction (default: asc)',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @Type(() => String)
  sort?: 'asc' | 'desc' = 'desc';
}
