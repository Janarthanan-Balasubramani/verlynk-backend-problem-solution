import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma.service';
import {
  CommonResponse,
  CustomUserResponseType,
  hashPassword,
  paginationResponse,
} from 'src/utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<CommonResponse<null>> {
    try {
      const isEmailAlreadyExist = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (isEmailAlreadyExist) {
        throw new BadRequestException('User email have been already taken');
      }

      const hashedPassword = await hashPassword(createUserDto.password);

      await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          password: hashedPassword,
        },
      });
      return {
        message: 'User created successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async findAll(
    page: number,
    search: string,
  ): Promise<CommonResponse<CustomUserResponseType>> {
    try {
      const itemsPerPage = 10;
      const offset = page == null || page == 0 ? 0 : (page - 1) * itemsPerPage;
      const filter: Prisma.UserWhereInput = {
        isActive: true,
        OR: [
          {
            firstName: {
              contains: search,
            },
          },
          {
            lastName: {
              contains: search,
            },
          },
          {
            email: {
              contains: search,
            },
          },
        ],
      };
      const users = await this.prisma.user.findMany({
        where: filter,
        skip: offset,
        take: itemsPerPage,
        select: {
          id: true,
        },
      });

      const usersCount = await this.prisma.user.count({
        where: filter,
      });

      const data = paginationResponse(page, itemsPerPage, usersCount, users);

      return {
        message: 'Users Fetched successfully',
        data,
      };
    } catch (err) {
      throw err;
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
  ): Promise<CommonResponse<null>> {
    try {
      const isUserWithIdExist = await this.prisma.user.findUnique({
        where: {
          id: updateUserDto.id,
        },
      });

      if (!isUserWithIdExist) {
        throw new BadRequestException("This user doesn't exist");
      }

      const isEmailExistWithAnotherUser = await this.prisma.user.findFirst({
        where: {
          id: {
            not: updateUserDto.id,
          },
          email: updateUserDto.email,
        },
      });

      if (isEmailExistWithAnotherUser) {
        new BadRequestException(
          'This email is already been taken with another user',
        );

        await this.prisma.user.update({
          where: {
            id: updateUserDto.id,
          },
          data: {
            email: updateUserDto.email,
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
          },
        });

        return {
          message: 'The user details have been successfully updated',
        };
      }
    } catch (err) {
      throw err;
    }
  }

  async remove(id: number): Promise<CommonResponse<null>> {
    try {
      const isUserWithIdExist = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!isUserWithIdExist) {
        throw new BadRequestException("This user doesn't exist");
      }

      if (isUserWithIdExist.isActive == false) {
        throw new BadRequestException('This user already been deleted');
      }

      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          isActive: false,
        },
      });

      return {
        message: 'The user have been deleted successfully',
      };
    } catch (err) {
      throw err;
    }
  }
}
