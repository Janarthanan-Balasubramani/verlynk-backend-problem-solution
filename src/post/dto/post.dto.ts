import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  authorId: number;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  id: number;
}
