import { Prisma } from './../../node_modules/.prisma/client/index.d';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PrismaService } from 'src/prisma.service';
import { CommonResponse, paginationResponse } from 'src/utils';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *@function :create
   *
   * @description : creates new post for the user account
   *
   * @param createPostDto(CreatePostDto) title and content details of the post going to be created
   *
   * @param authorId(number)  userId of who is going to create the post
   *
   * @returns success message or throws error if any
   */
  async create(
    authorId: number,
    createPostDto: CreatePostDto,
  ): Promise<CommonResponse<null>> {
    try {
      await this.prisma.post.create({
        data: {
          content: createPostDto.content,
          title: createPostDto.title,
          authorId,
        },
      });
      return {
        message: 'Post created successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   *@function :findAll
   *
   * @description : finds All posts that have been created by the user
   *
   * @param page:number for pagination purpose
   * @param search string for searching the post with the keyword
   * @param authorId id of the user who created the posts
   * @returns
   *  Pagination Response of the posts
   */
  async findAll(
    authorId: number,
    page: number,
    search: string,
  ): Promise<CommonResponse<Post>> {
    try {
      const itemsPerPage = 10;
      const offset = page == null || page == 0 ? 0 : (page - 1) * itemsPerPage;
      const filter: Prisma.PostWhereInput = {
        isActive: true,
        authorId,
        OR: [
          {
            content: {
              contains: search,
            },
          },
          {
            title: {
              contains: search,
            },
          },
        ],
      };
      const posts = await this.prisma.post.findMany({
        where: filter,
        skip: offset,
        take: itemsPerPage,
      });

      const postsCount = await this.prisma.post.count({
        where: filter,
      });
      const data = paginationResponse(page, itemsPerPage, postsCount, posts);
      return {
        message: 'Posts fetched  successfully',
        data,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   *@function :update
   *
   * @description :updates the post like title and content of the post
   *
   * @param  updatePostDto(UpdatePostDto) id and post details of the post going to be updated
  
   * @returns success message or throws error message if any 
   */
  async update(updatePostDto: UpdatePostDto): Promise<CommonResponse<null>> {
    try {
      // checking if post exist with the id
      const isPostExistWithId = await this.prisma.post.findUnique({
        where: {
          id: updatePostDto.id,
        },
      });

      // if post not exist we are throwing error
      if (!isPostExistWithId) {
        throw new BadRequestException("This post doesn't exist");
      }

      // updating the post details
      await this.prisma.post.update({
        where: {
          id: updatePostDto.id,
        },
        data: {
          content: updatePostDto.content,
          title: updatePostDto.title,
        },
      });
      return {
        message: 'Post updated successfully',
      };
    } catch (err) {
      throw err;
    }
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

  async remove(id: number): Promise<CommonResponse<null>> {
    try {
      // checking if the post exist with the id given
      const isPostExistWithId = await this.prisma.post.findUnique({
        where: {
          id,
        },
      });

      // if not exist we throw error
      if (!isPostExistWithId) {
        throw new BadRequestException("This post doesn't exist");
      }
      // if post already deleted means we are throwing error
      if (isPostExistWithId.isActive == false) {
        throw new BadRequestException('This post already been deleted');
      }
      // updating the post status to isActive false
      await this.prisma.post.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });
      return {
        message: 'Post have been deleted successfully',
      };
    } catch (err) {
      throw err;
    }
  }
}
