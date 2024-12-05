import { IsString, IsNumber, IsLatitude, IsLongitude, ValidateIf, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreatePlaceDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsString()
    tag: string;

    @IsLatitude()
    lat: number;

    @IsLongitude()
    lon: number;
}

export class SearchPlaceDto {
    @IsArray()
    @IsNotEmpty()
    geofenceBoundary: number[][]; // Array of [lon, lat] pairs defining the geofence (polygon)
  
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    tag?: string;
  
    @IsOptional()
    @IsString()
    type?: string;
  }