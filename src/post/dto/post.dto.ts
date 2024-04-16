import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  id: number;
}
