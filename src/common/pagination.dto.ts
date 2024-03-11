import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsIn([10, 25, 50, 100, 1000])
  @IsOptional()
  readonly pageSize?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }
}
