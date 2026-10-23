import { Type } from 'class-transformer';
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
