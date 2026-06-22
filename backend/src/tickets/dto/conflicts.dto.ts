import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class ConflictsTicketsDto {
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
  stationCode?: string;

  @IsOptional()
  @IsString()
  utilityType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusMeters?: number;

}