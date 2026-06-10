import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class SearchTicketsDto {
  @IsNotEmpty()
  @Matches(
    /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/,
    {
      message: 'bbox must be: minLng,minLat,maxLng,maxLat',
    },
  )
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