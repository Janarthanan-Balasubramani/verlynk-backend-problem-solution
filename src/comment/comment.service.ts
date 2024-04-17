import { Prisma } from './../../node_modules/.prisma/client/index.d';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'src/prisma.service';
import { CommonResponse, paginationResponse } from 'src/utils';
import { Comment } from '@prisma/client';
import { error } from 'console';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *@function :create
   *
   * @description : creates an new comment for the user
   *
   * @param createCommentDto(CreateCommentDto)  comment going to be created with postId where comment going to be given under the post
   * @param userId userId of the user who is going to post the comment
   *
   * @returns Success message or throws error if any
   */
  async create(
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<CommonResponse<null>> {
    try {
      // checks if post exist
      const isPostAlreadyExist = await this.prisma.post.findUnique({
        where: {
          id: createCommentDto.postId,
        },
      });
      // if post not exist it throws error
      if (!isPostAlreadyExist) {
        throw new BadRequestException(
          "Post doesn't exist so comment can't be posted ",
        );
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
  /**
   *@function :findAll
   *
   * @description : finds All comments that have been created by the user
   *
   * @param  authorId(number)  user id whose comments would be listed
   * @param page:number for pagination purpose
   *
   * @returns
   *  Pagination Response of the comments with the posts that have been associated with the comment
   */

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
  async update(
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommonResponse<null>> {
    try {
      const isCommentExistWithId = await this.prisma.comment.findUnique({
        where: {
          id: updateCommentDto.commentId,
        },
      });

      // checking if the comment exist with the id
      if (!isCommentExistWithId) {
        throw new error("Comment does't exist with the id provided");
      }
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
  async remove(id: number): Promise<CommonResponse<null>> {
    try {
      //checking if the comment exist with the id
      const isCommentExistWithId = await this.prisma.comment.findUnique({
        where: {
          id,
        },
      });
      // if not throws error
      if (!isCommentExistWithId) {
        throw new BadRequestException("This comment doesn't exist");
      }
      // checking if the comment have been already deleted
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
