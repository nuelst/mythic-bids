import type { Type as Class } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  get skip() {
    return (this.page - 1) * this.pageSize;
  }
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export function toPage<T>(
  [items, total]: [T[], number],
  { page, pageSize }: PaginationQueryDto,
): Page<T> {
  return { items, page, pageSize, total };
}

/** Swagger schema for a page of `item`: `class LotPageDto extends PageDto(LotDto) {}`. */
export function PageDto<T>(item: Class<T>) {
  abstract class PageOf {
    @ApiProperty({ type: [item] })
    items: T[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    total: number;
  }
  return PageOf;
}
