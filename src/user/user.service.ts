import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma.service';
import {hashPassword } from 'src/utils';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const isEmailAlreadyExist = await this.prisma.user.findUnique({
      where:{ 
        email:createUserDto.email
      }
    })
    if(isEmailAlreadyExist){
    throw new BadRequestException("User email have been already taken")
   
    }

    
 const hashedPassword =   await hashPassword(createUserDto.password)

 await this.prisma.user.create({
  data:{
    email:createUserDto.email,
    firstName:createUserDto.firstName,
    lastName:createUserDto.lastName,
    password:hashedPassword
  }
 })
return {
  "Message":"User Have been created successfully"
}
  }

 async  findAll() {
    
   const users  = await this.prisma.user.findMany({
    where:{
      isActive:true
    },
   
   })
return users 
  }


async   updateUser( updateUserDto: UpdateUserDto) {

  const isUserWithIdExist = await this.prisma.user.findUnique({
    where:{
      id:updateUserDto.id
    }
  })



  if (!isUserWithIdExist){
    throw new BadRequestException("This user doesn't exist")
  }

 const  isEmailExistWithAnotherUser = await this.prisma.user.findFirst({
  where:{
   id:{
    not:updateUserDto.id
   },
    email:updateUserDto.email
  }
 })

 if(isEmailExistWithAnotherUser){
 new BadRequestException("This email is already been taken with another user")

 await this.prisma.user.update({
  where:{
    id:updateUserDto.id
  },
  data:{
    email:updateUserDto.email,
    firstName:updateUserDto.firstName,
    lastName:updateUserDto.lastName,

  }
 })

return {
  "Message":"The user details have been successfully updated"
}
 }



  }

 async  remove(id: number) {
      const isUserWithIdExist = await this.prisma.user.findUnique({
    where:{
      id
    }
  })



  if (!isUserWithIdExist){
    throw new BadRequestException("This user doesn't exist")
  }
  
  const isUserIsActive = await this.prisma.user.findUnique({
    where:{
      id,
isActive:true,
    }
  })

  if (!isUserIsActive){
    throw new BadRequestException("This user already been deleted")
  }


await this.prisma.user.update({
  where:{
    id:id
  },
  data:{
    isActive:false
  }
})

return {
  "Message":"The user have been deleted successfully"
}

  }
}
