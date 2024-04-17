import { Prisma } from './../../node_modules/.prisma/client/index.d';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'src/prisma.service';
import { CommonResponse, paginationResponse } from 'src/utils';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<CommonResponse<null>> {
    try {
    const   isPostAlreadyExist = await this.prisma.post.findUnique({
        where:{
          id:createCommentDto.postId
        }
      })

      if(!isPostAlreadyExist){
        throw new BadRequestException("Post doesn't exist so comment can't be posted ")
      }
      await this.prisma.comment.create({
        data: {
          postId: createCommentDto.postId,
          comment: createCommentDto.comment,
          authorId: userId,
        },
      });

      return {
        message: 'Comment have been created successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async findAll(
    authorId: number,
    page: number,
  ): Promise<CommonResponse<Comment>> {
    try {
      const itemsPerPage = 10;
      const offset = page == null || page == 0 ? 0 : (page - 1) * itemsPerPage;

      const filter: Prisma.CommentWhereInput = {
        isActive: true,
        authorId,
      };
      const comments = await this.prisma.comment.findMany({
        where: filter,
        skip: offset,
        take: itemsPerPage,
        include: {
          post: true,
        },
      });
      const commentsCount = await this.prisma.comment.count({
        where: filter,
      });
      const data = paginationResponse(
        page,
        itemsPerPage,
        commentsCount,
        comments,
      );

      return {
        message: 'Comments  fetched successfully',
        data,
      };
    } catch (err) {
      throw err;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommonResponse<null>> {
    try {
      await this.prisma.comment.update({
        where: {
          id: updateCommentDto.commentId,
        },
        data: {
          comment: updateCommentDto.comment,
        },
      });
      return {
        message: 'Comment updated successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async remove(id: number): Promise<CommonResponse<null>> {
    try {
      const isCommentExistWithId = await this.prisma.comment.findUnique({
        where: {
          id,
        },
      });
      if (!isCommentExistWithId) {
        throw new BadRequestException("This comment doesn't exist");
      }
      if (isCommentExistWithId.isActive == false) {
        throw new BadRequestException('This comment already been deleted');
      }
      await this.prisma.comment.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });
      return {
        message: 'Comment deleted successfully',
      };
    } catch (err) {
      throw err;
    }
  }
}
