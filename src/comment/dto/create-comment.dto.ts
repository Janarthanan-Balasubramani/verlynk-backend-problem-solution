import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comment: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  postId: number;
}
export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  commentId: number;
}
