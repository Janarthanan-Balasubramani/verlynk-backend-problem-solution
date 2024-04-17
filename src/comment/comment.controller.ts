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
  /**
   *@function :create
   *
   * @description : creates an new comment for the user
   *
   * @param createCommentDto(CreateCommentDto)  comment going to be created with postId where comment going to be given under the post
   * @param @Req(req)   request that has been made we are going to extract the userId from the request they are making since we have appended the user id in guard itself
   *
   * @returns Success message or throws error if any
   */
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    // getting the userId from the request

    const authorId = req.user.userId;

    return this.commentService.create(authorId, createCommentDto);
  }

  @Get()
  /**
   *@function :findAll
   *
   * @description : finds All comments that have been created by the user
   *
   * @param page:number for pagination purpose
   * @param  @Req(req)   request that has been made we are going to extract the userId from the request they are making since we have appended the user id in guard itself
   * @returns
   *  Pagination Response of the comments with the posts that have been associated with the comment
   */
  findAll(@Query('page') page: number, @Req() req) {
    // getting the userId from the request

    const authorId = req.user.userId;
    return this.commentService.findAll(authorId, page);
  }

  @Patch()
  /**
   *@function :update
   *
   * @description :updates the comment posted by the user
   *
   * @param updateCommentDto(UpdateCommentDto) updated comment with the comment id
   *
   *
   * @returns success message or failure message if any
   */
  update(@Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(updateCommentDto);
  }

  @Delete(':id')
  /**
   *@function :remove
   *
   * @description :removes the comment posted by the user
   *
   * @param  id(number) id of the comment which is going to be deleted
   *
   *
   * @returns success message or failure message if any
   */
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
