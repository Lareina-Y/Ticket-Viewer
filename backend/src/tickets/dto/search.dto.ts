import { IsOptional, IsString } from 'class-validator';

export class SearchTicketsDto {
  bbox!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  stationCode?: string;

  @IsOptional()
  @IsString()
  utilityType?: string;
}