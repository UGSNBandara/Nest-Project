import { IsString, IsNotEmpty } from 'class-validator';
import { IsNumber, Min, Max } from 'class-validator';
import { ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class FloodFillDto {
  @IsString()
  @IsNotEmpty()
  imagePath: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  sr: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  sc: number;

  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  newColor: [number, number, number];

  @IsNumber()
  @Min(0)
  tolerance?: number;
}
