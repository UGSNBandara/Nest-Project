import { ApiProperty } from '@nestjs/swagger';

export class ResizeImageDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;

  @ApiProperty({
    example: 800,
    description: 'Target width in pixels',
  })
  width: number;

  @ApiProperty({
    example: 600,
    description: 'Target height in pixels',
  })
  height: number;
}

export class FloodFillDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;

  @ApiProperty({
    example: 100,
    description: 'Starting row position',
  })
  sr: number;

  @ApiProperty({
    example: 150,
    description: 'Starting column position',
  })
  sc: number;

  @ApiProperty({
    example: [255, 255, 255],
    description: 'New color in RGB format',
    type: [Number],
  })
  newColor: [number, number, number];
}

export class GreyscaleDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;
}

export class ContrastDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;

  @ApiProperty({
    example: 20,
    description: 'Contrast factor (values > 1 increase contrast, values < 1 decrease contrast)',
  })
  contrast: number;
}

export class ImagePathDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;
}

export class RotateImageDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;

  @ApiProperty({
    example: 90,
    description: 'Rotation angle in degrees',
  })
  angle: number;
}

export class SharpenImageDto {
  @ApiProperty({
    example: 'apps/cse40/images/input_image.png',
    description: 'Path to the image file',
  })
  imagePath: string;

  @ApiProperty({
    example: 0.04,
    description: 'Harris detector free parameter in the equation',
    required: false,
  })
  k?: number;

  @ApiProperty({
    example: 3,
    description: 'Size of the window for corner detection',
    required: false,
  })
  windowSize: number;

  @ApiProperty({
    example: 1e-5,
    description: 'Threshold value for corner detection',
    required: false,
  })
  thresh: number;
}