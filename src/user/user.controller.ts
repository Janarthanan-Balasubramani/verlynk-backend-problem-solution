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
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('page') page: number, @Query('search') search: string) {
    console.log(page);
    console.log(search);
    return this.userService.findAll(page, search);
  }
  @UseGuards(AuthGuard)
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
