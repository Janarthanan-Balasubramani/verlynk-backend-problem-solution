import { Prisma } from './../../node_modules/.prisma/client/index.d';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PrismaService } from 'src/prisma.service';
import { CommonResponse, paginationResponse } from 'src/utils';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

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

  async update(updatePostDto: UpdatePostDto): Promise<CommonResponse<null>> {
    try {
      const isPostExistWithId = await this.prisma.post.findUnique({
        where: {
          id: updatePostDto.id,
        },
      });

      if (!isPostExistWithId) {
        throw new BadRequestException("This post doesn't exist");
      }

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

  async remove(id: number): Promise<CommonResponse<null>> {
    try {
      const isPostExistWithId = await this.prisma.post.findUnique({
        where: {
          id,
        },
      });

      if (!isPostExistWithId) {
        throw new BadRequestException("This post doesn't exist");
      }

      if (isPostExistWithId.isActive == false) {
        throw new BadRequestException('This post already been deleted');
      }

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
