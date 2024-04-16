import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('verlynk')
@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const authorId = req.user.userId;

    return this.commentService.create(authorId, createCommentDto);
  }

  @Get()
  findAll(@Query('page') page: number, @Req() req) {
    const authorId = req.user.userId;

    return this.commentService.findAll(authorId, page);
  }

  @Patch()
  update(@Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
