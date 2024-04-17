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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('verlynk')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  /**
   *@function :create
   *
   * @description : register's new user details
   *
   * @param createUserDto(CreateUserDto) :details of the user going to be created like email , firstName,lastName,password
   * @returns success message or error message if any
   */
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   *@function :findAll
   *
   * @description : finds all the user details which have been created by the user
   *
   *
   * @param page:number for pagination purpose
   * @param search searching an specific user
   * @returns returns pagination response of the users details
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('page') page: number, @Query('search') search: string) {
    return this.userService.findAll(page, search);
  }
  @UseGuards(AuthGuard)
  @Patch()
  /**
   *@function :update
   *
   * @description : updates the user  details like firstName , lastName ,email
   *
   * @param updateUserDto(UpdateUserDto) id with user details to be updated
  
   * @returns success message or throws error
   */
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  /**
   *@function :remove
   *
   * @description : deletes the user details
   *
   * @param  id(number) :id of the user going to be deleted
   * @returns
   *   success message or throws error
   */
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
