import { IsString, IsNotEmpty } from 'class-validator';

export class HistogramEqualizationDto {
  @IsString()
  @IsNotEmpty()
  imagePath: string;
}
