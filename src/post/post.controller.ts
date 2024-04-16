import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('verlynk')
@UseGuards(AuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    const authorId = req.user.userId;
    return this.postService.create(authorId, createPostDto);
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('search') search: string,
    @Req() req,
  ) {
    const authorId = req.user.userId;
    return this.postService.findAll(authorId, page, search);
  }

  @Patch()
  update(@Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
