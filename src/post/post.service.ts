import { Prisma } from './../../node_modules/.prisma/client/index.d';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PrismaService } from 'src/prisma.service';
import { CommonResponse, paginationResponse } from 'src/utils';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<CommonResponse<null>> {
    await this.prisma.post.create({
      data: {
        content: createPostDto.content,
        title: createPostDto.title,
        authorId: createPostDto.authorId,
      },
    });

    return;
  }

  async findAll(page: number, search: string) {
    const itemsPerPage = 10;
    const offset = page == null || page == 0 ? 0 : (page - 1) * itemsPerPage;
    const filter: Prisma.PostWhereInput = {
      isActive: true,
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
      select: {
        id: true,
      },
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
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async update(updatePostDto: UpdatePostDto) {
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
  }

  async remove(id: number) {
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

    return {
      message: 'The post have been deleted successfully',
    };
  }
}
