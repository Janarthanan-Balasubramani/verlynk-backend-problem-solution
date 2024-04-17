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

  /**
   *@function :create
   *
   * @description : register's new user details
   *
   * @param createUserDto(CreateUserDto) :details of the user going to be created like email , firstName,lastName,password
   * @returns success message or error message if any
   */
  async create(createUserDto: CreateUserDto): Promise<CommonResponse<null>> {
    try {
      // checks if the email already exist with another user
      const isEmailAlreadyExist = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      // if email exist with another user we are throwing error
      if (isEmailAlreadyExist) {
        throw new BadRequestException('User email have been already taken');
      }

      // hashing password for better security
      const hashedPassword = await hashPassword(createUserDto.password);

      // creating the user
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

  /**
   *@function :findAll
   *
   * @description : finds all the user details which have been created by the user
  
   * @param page:number for pagination purpose
   * @param search searching an specific user
   * @returns returns pagination response of the users details
   */
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
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
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
  /**
   *@function :update
   *
   * @description : updates the user  details like firstName , lastName ,email
   *
   * @param updateUserDto(UpdateUserDto) id with user details to be updated
  
   * @returns success message or throws error
   */
  async updateUser(
    updateUserDto: UpdateUserDto,
  ): Promise<CommonResponse<null>> {
    try {
      // checking if user Exist with the id
      const isUserWithIdExist = await this.prisma.user.findUnique({
        where: {
          id: updateUserDto.id,
        },
      });
      // throws error if user  not exist with the id
      if (!isUserWithIdExist) {
        throw new BadRequestException("This user doesn't exist");
      }

      // checking if user email which is going to be updated is already taken by another user
      const isEmailExistWithAnotherUser = await this.prisma.user.findFirst({
        where: {
          id: {
            not: updateUserDto.id,
          },
          email: updateUserDto.email,
        },
      });

      // if email is with another user means we are throwing error
      if (isEmailExistWithAnotherUser) {
        throw new BadRequestException(
          'This email is already been taken with another user',
        );
      }
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
    } catch (err) {
      throw err;
    }
  }

  /**
   *@function :remove
   *
   * @description : deletes the user details
   *
   * @param  id(number) :id of the user going to be deleted
   * @returns
   *   success message or throws error
   */
  async remove(id: number): Promise<CommonResponse<null>> {
    try {
      // checking if user Exist with the id

      const isUserWithIdExist = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      // if user does not exist with the id we are throwing error

      if (!isUserWithIdExist) {
        throw new BadRequestException("This user doesn't exist");
      }

      // if user is already deleted means we are throwing error
      if (isUserWithIdExist.isActive == false) {
        throw new BadRequestException('This user already been deleted');
      }

      //soft deleting the user
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
