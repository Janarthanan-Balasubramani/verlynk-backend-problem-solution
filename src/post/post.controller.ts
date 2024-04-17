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
  /**
   *@function :create
   *
   * @description : creates new post for the user account
   *
   * @param createPostDto(CreatePostDto) title and content details of the post going to be created
   *
   * @param @Req(req)   request that has been made we are going to extract the userId from the request they are making since we have appended the user id in guard itself
   *
   * @returns success message or throws error if any
   */
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    // getting the userId from the request
    const authorId = req.user.userId;
    return this.postService.create(authorId, createPostDto);
  }

  @Get()
  /**
   *@function :findAll
   *
   * @description : finds All posts that have been created by the user
   *
   * @param page:number for pagination purpose
   * @param search string for searching the post with the keyword
   * @param  @Req(req)   request that has been made we are going to extract the userId from the request they are making since we have appended the user id in guard itself
   * @returns
   *  Pagination Response of the posts
   */
  findAll(
    @Query('page') page: number,
    @Query('search') search: string,
    @Req() req,
  ) {
    const authorId = req.user.userId;
    return this.postService.findAll(authorId, page, search);
  }

  @Patch()
  /**
   *@function :update
   *
   * @description :updates the post  title and content of the post
   *
   * @param  updatePostDto(UpdatePostDto) id and post details of the post going to be updated
  
   * @returns success message or throws error message if any 
   */
  update(@Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(updatePostDto);
  }

  /**
   *@function :Delete
   *
   * @description :deletes the post created by user 
   *
   * @param  id(number) of the post going to be deleted
   
   * @returns  
  * success message or throws error message 
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
